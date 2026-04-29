'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

/**
 * Activated when the site is loaded inside the CMS Visual Editor (?cms=true).
 * Features:
 *  - Hover outlines on editable elements
 *  - Click to select — sends cms:select to parent
 *  - Drag-to-move selected element (position: relative offsets)
 *  - 8 resize handles on selected element
 *  - On drag/resize end sends cms:styleChange to parent
 *  - Listens for cms:update (text/src/alt), cms:applyStyle
 */
export default function CMSOverlay() {
  const params = useSearchParams()
  const enabled = params.get('cms') === 'true'

  useEffect(() => {
    if (!enabled) return

    const styleEl = document.createElement('style')
    styleEl.textContent = `
      [data-cms-hover] { outline: 2px solid rgba(1,180,175,0.55) !important; outline-offset: 2px !important; cursor: pointer !important; }
      [data-cms-selected] { outline: 2px solid rgba(1,180,175,1) !important; outline-offset: 2px !important; }
    `
    document.head.appendChild(styleEl)

    let selectedEl: Element | null = null
    let overlayEl: HTMLDivElement | null = null
    let isDragging = false
    let isResizing = false
    let resizeDir = ''
    let didDrag = false
    let dragStartX = 0
    let dragStartY = 0
    let elStartTop = 0
    let elStartLeft = 0
    let elStartWidth = 0
    let elStartHeight = 0

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

    function removeOverlay() {
      overlayEl?.remove()
      overlayEl = null
    }

    function syncOverlay() {
      if (!selectedEl || !overlayEl) return
      const rect = selectedEl.getBoundingClientRect()
      overlayEl.style.top = `${rect.top}px`
      overlayEl.style.left = `${rect.left}px`
      overlayEl.style.width = `${rect.width}px`
      overlayEl.style.height = `${rect.height}px`
    }

    function createOverlay(el: Element) {
      removeOverlay()
      const htmlEl = el as HTMLElement
      const rect = el.getBoundingClientRect()
      elStartTop = parseFloat(htmlEl.style.top) || 0
      elStartLeft = parseFloat(htmlEl.style.left) || 0
      elStartWidth = rect.width
      elStartHeight = rect.height

      const ov = document.createElement('div')
      overlayEl = ov
      ov.setAttribute('data-cms-overlay', '1')
      ov.style.cssText = `
        position: fixed;
        top: ${rect.top}px;
        left: ${rect.left}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
        z-index: 99995;
        box-sizing: border-box;
        pointer-events: none;
      `

      // Tag label
      const label = document.createElement('div')
      label.style.cssText = `
        position: absolute;
        top: -22px; left: -1px;
        background: #01B4AF; color: #031119;
        font-size: 10px; font-family: monospace;
        padding: 2px 7px; border-radius: 3px 3px 0 0;
        user-select: none; pointer-events: none;
        white-space: nowrap; z-index: 3;
      `
      label.textContent = el.tagName.toLowerCase()
      ov.appendChild(label)

      // Move area (covers the element, enables drag-to-move)
      const moveArea = document.createElement('div')
      moveArea.style.cssText = `
        position: absolute; inset: 0;
        cursor: move; pointer-events: all; z-index: 1;
      `
      moveArea.title = 'Drag to move'
      ov.appendChild(moveArea)

      // 8 resize handles
      const handles = [
        { dir: 'n',  css: 'top:-5px;left:calc(50% - 4px);cursor:n-resize;' },
        { dir: 's',  css: 'bottom:-5px;left:calc(50% - 4px);cursor:s-resize;' },
        { dir: 'w',  css: 'left:-5px;top:calc(50% - 4px);cursor:w-resize;' },
        { dir: 'e',  css: 'right:-5px;top:calc(50% - 4px);cursor:e-resize;' },
        { dir: 'nw', css: 'top:-5px;left:-5px;cursor:nw-resize;' },
        { dir: 'ne', css: 'top:-5px;right:-5px;cursor:ne-resize;' },
        { dir: 'sw', css: 'bottom:-5px;left:-5px;cursor:sw-resize;' },
        { dir: 'se', css: 'bottom:-5px;right:-5px;cursor:se-resize;' },
      ]
      handles.forEach(({ dir, css }) => {
        const h = document.createElement('div')
        h.dataset.cmsHandle = dir
        h.style.cssText = `
          position: absolute; width: 8px; height: 8px;
          background: #01B4AF; border: 2px solid #fff;
          border-radius: 2px; z-index: 2; pointer-events: all;
          ${css}
        `
        ov.appendChild(h)
      })

      ov.addEventListener('mousedown', (e) => {
        const target = e.target as HTMLElement
        const dir = target.dataset.cmsHandle
        dragStartX = e.clientX
        dragStartY = e.clientY
        didDrag = false
        const curRect = selectedEl!.getBoundingClientRect()
        elStartWidth = curRect.width
        elStartHeight = curRect.height
        elStartTop = parseFloat((selectedEl as HTMLElement).style.top) || 0
        elStartLeft = parseFloat((selectedEl as HTMLElement).style.left) || 0
        if (dir) {
          isResizing = true
          resizeDir = dir
        } else {
          isDragging = true
        }
        e.preventDefault()
        e.stopPropagation()
      }, true)

      document.body.appendChild(ov)
    }

    function onMouseMove(e: MouseEvent) {
      if (!isDragging && !isResizing) return
      if (!selectedEl) return
      const dx = e.clientX - dragStartX
      const dy = e.clientY - dragStartY
      if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return
      didDrag = true
      const htmlEl = selectedEl as HTMLElement

      if (isDragging) {
        htmlEl.style.position = 'relative'
        htmlEl.style.top = `${elStartTop + dy}px`
        htmlEl.style.left = `${elStartLeft + dx}px`
      } else if (isResizing) {
        const dir = resizeDir
        if (dir.includes('e')) htmlEl.style.width = `${Math.max(20, elStartWidth + dx)}px`
        if (dir.includes('s')) htmlEl.style.height = `${Math.max(20, elStartHeight + dy)}px`
        if (dir.includes('w')) {
          htmlEl.style.width = `${Math.max(20, elStartWidth - dx)}px`
          htmlEl.style.position = 'relative'
          htmlEl.style.left = `${elStartLeft + dx}px`
        }
        if (dir.includes('n')) {
          htmlEl.style.height = `${Math.max(20, elStartHeight - dy)}px`
          htmlEl.style.position = 'relative'
          htmlEl.style.top = `${elStartTop + dy}px`
        }
      }
      syncOverlay()
    }

    function onMouseUp() {
      if (!isDragging && !isResizing) return
      isDragging = false
      isResizing = false
      if (!selectedEl || !didDrag) return

      const htmlEl = selectedEl as HTMLElement
      const pendingStyle: Record<string, string> = {}
      if (htmlEl.style.position) pendingStyle.position = htmlEl.style.position
      if (htmlEl.style.top) pendingStyle.top = htmlEl.style.top
      if (htmlEl.style.left) pendingStyle.left = htmlEl.style.left
      if (htmlEl.style.width) pendingStyle.width = htmlEl.style.width
      if (htmlEl.style.height) pendingStyle.height = htmlEl.style.height

      if (Object.keys(pendingStyle).length > 0) {
        window.parent.postMessage({
          type: 'cms:styleChange',
          xpath: getXPath(selectedEl),
          text: selectedEl.textContent?.trim().slice(0, 300) ?? '',
          tagName: selectedEl.tagName.toLowerCase(),
          style: pendingStyle,
        }, '*')
      }
    }

    function onMouseOver(e: MouseEvent) {
      const el = e.target as Element
      if (overlayEl?.contains(el)) return
      if (!isEditable(el)) return
      el.setAttribute('data-cms-hover', '1')
    }

    function onMouseOut(e: MouseEvent) {
      const el = e.target as Element
      el.removeAttribute('data-cms-hover')
    }

    function onClick(e: MouseEvent) {
      if (didDrag) { didDrag = false; return }
      const el = e.target as Element
      if (overlayEl?.contains(el)) return
      if ((el as HTMLElement).closest('[data-cms-overlay]')) return
      if (!isEditable(el)) return
      e.preventDefault()
      e.stopPropagation()

      if (selectedEl) selectedEl.removeAttribute('data-cms-selected')
      selectedEl = el
      el.setAttribute('data-cms-selected', '1')

      createOverlay(el)
      window.parent.postMessage({ type: 'cms:select', ...elementData(el) }, '*')
    }

    function sendStructure() {
      const sections = Array.from(document.querySelectorAll('section, [data-section]')).map(el => ({
        xpath: getXPath(el),
        name: el.getAttribute('aria-label') ?? el.id ?? el.querySelector('h1,h2,h3')?.textContent?.trim() ?? el.tagName.toLowerCase(),
      }))
      window.parent.postMessage({ type: 'cms:structure', sections }, '*')
    }

    function onMessage(e: MessageEvent) {
      if (e.data?.type === 'cms:update') {
        const { xpath, property, value } = e.data as { xpath: string; property: string; value: string }
        try {
          const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
          const el = result.singleNodeValue as Element | null
          if (!el) return
          if (property === 'text') el.textContent = value
          else if (property === 'src') (el as HTMLImageElement).src = value
          else if (property === 'alt') (el as HTMLImageElement).alt = value
        } catch { /* ignore */ }
      } else if (e.data?.type === 'cms:applyStyle') {
        const { xpath, style } = e.data as { xpath: string; style: Record<string, string> }
        try {
          const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
          const el = result.singleNodeValue as HTMLElement | null
          if (!el) return
          Object.assign(el.style, style)
          syncOverlay()
        } catch { /* ignore */ }
      }
    }

    document.addEventListener('mouseover', onMouseOver)
    document.addEventListener('mouseout', onMouseOut)
    document.addEventListener('click', onClick, true)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    window.addEventListener('message', onMessage)
    window.addEventListener('scroll', syncOverlay, { passive: true })
    window.addEventListener('resize', syncOverlay)

    const rafId = requestAnimationFrame(sendStructure)

    return () => {
      document.removeEventListener('mouseover', onMouseOver)
      document.removeEventListener('mouseout', onMouseOut)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('message', onMessage)
      window.removeEventListener('scroll', syncOverlay)
      window.removeEventListener('resize', syncOverlay)
      cancelAnimationFrame(rafId)
      styleEl.remove()
      removeOverlay()
      if (selectedEl) {
        selectedEl.removeAttribute('data-cms-selected')
        selectedEl = null
      }
    }
  }, [enabled])

  return null
}

