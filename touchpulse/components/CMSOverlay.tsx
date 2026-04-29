'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

/**
 * When the site is loaded inside the CMS Visual Editor (/?cms=true),
 * this component activates hover outlines and click-to-select behaviour,
 * sending postMessage events to the parent CMS window.
 * It also listens for 'cms:update' messages and applies live text/src edits.
 */
export default function CMSOverlay() {
  const params = useSearchParams()
  const enabled = params.get('cms') === 'true'

  useEffect(() => {
    if (!enabled) return

    // Inject outline styles
    const style = document.createElement('style')
    style.id = 'cms-overlay-styles'
    style.textContent = `
      [data-cms-hover] { outline: 2px solid rgba(1,180,175,0.55) !important; outline-offset: 2px !important; cursor: pointer !important; }
      [data-cms-selected] { outline: 2px solid rgba(1,180,175,1) !important; outline-offset: 2px !important; cursor: pointer !important; }
    `
    document.head.appendChild(style)

    let selectedEl: Element | null = null

    const EDITABLE_TAGS = new Set([
      'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'span', 'a', 'li', 'button', 'label',
      'img', 'video',
      'section', 'div', 'main', 'article', 'header', 'footer',
    ])

    function getXPath(el: Element): string {
      if (el.id) return `//*[@id="${el.id}"]`
      const parts: string[] = []
      let node: Element | null = el
      while (node && node.nodeType === Node.ELEMENT_NODE) {
        let index = 1
        let sib = node.previousElementSibling
        while (sib) {
          if (sib.tagName === node.tagName) index++
          sib = sib.previousElementSibling
        }
        parts.unshift(`${node.tagName.toLowerCase()}[${index}]`)
        node = node.parentElement
      }
      return `/${parts.join('/')}`
    }

    function isEditable(el: Element) {
      return EDITABLE_TAGS.has(el.tagName.toLowerCase())
    }

    function elementData(el: Element) {
      const tag = el.tagName.toLowerCase()
      const imgEl = el as HTMLImageElement
      return {
        xpath: getXPath(el),
        tagName: tag,
        text: ['img', 'video'].includes(tag) ? null : (el.textContent?.trim().slice(0, 500) ?? null),
        src: imgEl.src ?? null,
        alt: imgEl.alt ?? null,
        component: el.getAttribute('data-component') ?? el.className?.toString().split(' ')[0] ?? tag,
      }
    }

    function onMouseOver(e: MouseEvent) {
      const el = e.target as Element
      if (!isEditable(el)) return
      el.setAttribute('data-cms-hover', '1')
    }

    function onMouseOut(e: MouseEvent) {
      const el = e.target as Element
      el.removeAttribute('data-cms-hover')
    }

    function onClick(e: MouseEvent) {
      const el = e.target as Element
      if (!isEditable(el)) return
      e.preventDefault()
      e.stopPropagation()

      if (selectedEl) selectedEl.removeAttribute('data-cms-selected')
      selectedEl = el
      el.setAttribute('data-cms-selected', '1')

      window.parent.postMessage({ type: 'cms:select', ...elementData(el) }, '*')
    }

    // Send section structure to parent
    function sendStructure() {
      const sections = Array.from(
        document.querySelectorAll('section, [data-section]')
      ).map(el => ({
        xpath: getXPath(el),
        name:
          el.getAttribute('aria-label') ??
          el.id ??
          el.querySelector('h1,h2,h3')?.textContent?.trim() ??
          el.tagName.toLowerCase(),
      }))
      window.parent.postMessage({ type: 'cms:structure', sections }, '*')
    }

    // Handle live update messages from parent CMS
    function onMessage(e: MessageEvent) {
      if (e.data?.type !== 'cms:update') return
      const { xpath, property, value } = e.data as { xpath: string; property: string; value: string }
      try {
        const result = document.evaluate(
          xpath,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        )
        const el = result.singleNodeValue as Element | null
        if (!el) return
        if (property === 'text') {
          el.textContent = value
        } else if (property === 'src') {
          (el as HTMLImageElement).src = value
        } else if (property === 'alt') {
          (el as HTMLImageElement).alt = value
        }
      } catch {
        // XPath evaluation failure — ignore
      }
    }

    document.addEventListener('mouseover', onMouseOver)
    document.addEventListener('mouseout', onMouseOut)
    document.addEventListener('click', onClick, true)
    window.addEventListener('message', onMessage)

    // Send page structure once DOM is ready
    const rafId = requestAnimationFrame(sendStructure)

    return () => {
      document.removeEventListener('mouseover', onMouseOver)
      document.removeEventListener('mouseout', onMouseOut)
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('message', onMessage)
      cancelAnimationFrame(rafId)
      style.remove()
      if (selectedEl) {
        selectedEl.removeAttribute('data-cms-selected')
        selectedEl = null
      }
    }
  }, [enabled])

  return null
}
