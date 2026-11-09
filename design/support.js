window.__ready = false;
document.addEventListener('DOMContentLoaded', () => {
  class DCLogic { constructor(props) { this.props = props || {}; this.state = {}; } setState() {} forceUpdate() {} }
  window.DCLogic = DCLogic;
  const src = document.querySelector('script[type="text/x-dc"]').textContent;
  const Component = new Function('DCLogic', src + '\nreturn Component;')(DCLogic);
  const inst = new Component({});
  const vals = inst.renderVals();
  const look = (scope, path) => {
    path = path.trim();
    if (path === 'true') return true; if (path === 'false') return false;
    let v = scope; for (const k of path.split('.')) { if (v == null) return undefined; v = v[k]; } return v;
  };
  const interp = (str, scope) => str.replace(/\{\{([^}]+)\}\}/g, (_, p) => { const v = look(scope, p); return v == null ? '' : (typeof v === 'object' || typeof v === 'function' ? '' : String(v)); });
  const walk = (node, scope) => {
    if (node.nodeType === 3) { if (node.nodeValue.includes('{{')) node.nodeValue = interp(node.nodeValue, scope); return; }
    if (node.nodeType !== 1) return;
    const tag = node.tagName.toLowerCase();
    if (tag === 'sc-for') {
      const m = /\{\{([^}]+)\}\}/.exec(node.getAttribute('list') || ''); const list = (m && look(scope, m[1])) || [];
      const as = node.getAttribute('as'); const frag = document.createDocumentFragment();
      list.forEach((item, i) => { const c = node.cloneNode(true); const sc = Object.assign({}, scope, { [as]: item, $index: i });
        Array.from(c.childNodes).forEach((ch) => { frag.appendChild(ch); walk(ch, sc); }); });
      node.replaceWith(frag); return;
    }
    if (tag === 'sc-if') {
      const m = /\{\{([^}]+)\}\}/.exec(node.getAttribute('value') || ''); const ok = m && look(scope, m[1]);
      if (!ok) { node.remove(); return; }
      const kids = Array.from(node.childNodes); node.replaceWith(...kids); kids.forEach((k) => walk(k, scope)); return;
    }
    for (const a of Array.from(node.attributes)) {
      if (/^on[A-Z]/.test(a.name) || a.name.startsWith('on') || a.name === 'ref') { node.removeAttribute(a.name); continue; }
      if (a.value.includes('{{')) node.setAttribute(a.name, interp(a.value, scope));
    }
    Array.from(node.childNodes).forEach((ch) => walk(ch, scope));
  };
  const root = document.querySelector('x-dc');
  Array.from(root.childNodes).forEach((ch) => walk(ch, vals));
  document.head.insertAdjacentHTML('beforeend','<style>.pb-cv{content-visibility:visible !important}</style>'); window.__ready = true;
});
