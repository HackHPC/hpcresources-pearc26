(function () {
  'use strict';

  const GITHUB_REPO = 'HackHPC/hpcresources-pearc26';
  const SITE_BASEURL = document.body.dataset.baseurl || '';

  // Maps broader student fields of study to the resources most relevant to
  // them, curated from the PEARC26 HPC Resources list. Resource names must
  // match the "Name" column in _data/PEARC26-HPCResourceList-FullList.csv.
  // A resource can (and often should) appear under more than one major —
  // RESOURCE_MAJORS below builds a reverse index automatically, so listing
  // the same name in two arrays here is how multi-major linking works.
  const MAJOR_RESOURCE_MAP = {
    'Computer Science and Software Engineering': [
      'Association for Computing Machinery (ACM)', 'IEEE Computer Society', 'US-RSE (Research Software Engineering Association)',
      'Google Summer of Code (GSoC)', 'Jupyter', 'Apptainer', 'NCSA Learn',
      'BSSW - Formal Course Resources for Learning About HPC', 'Intro to HPC - SLURM Training (Cambi)',
      'The Carpentries - Adopting HPC Carpentry', 'SC (Supercomputing Conference)',
      'HPDC (High-Performance Parallel and Distributed Computing)', 'ISC High Performance', 'WeTeachCS',
      'TACC Analysis Portal (TAP)', 'CIQ', 'Globus', 'Open OnDemand', 'GitHub Student Developer Pack',
      'AI Squared Student Program (UNIFI)', 'Cerebras Cloud (Inference API)', 'Exa AI (Neural Search API)',
      'Free AI Tools GitHub List', 'Google AI Studio (Gemini API)', 'Groq Cloud', 'Hugging Face',
      'LM Studio', 'Ollama', 'OpenRouter', 'StudentOffers — Free LLM API Proxy', 'xAI Grok API',
    ],
    'Cybersecurity, IT, Networking, and Cloud': [
      'ACCESS Cyberinfrastructure', 'ACCESS Campus Champions', 'Open HPC',
      'NRP (National Research Platform)', 'Cloudbank ACCESS', 'ACCESS Allocations',
      'PATh/Open Science Pool', 'Cambridge Computer', 'Amazon Web Services (AWS)', 'Google Cloud',
      'CIQ', 'Internet2', 'SHI Public Sector (with Dell)', 'AuriStor',
      'National Center for Supercomputing Applications (NCSA)', 'Atempo', 'BeeGFS (ThinkParQ)', 'Globus',
      'Neuvys Technologies / NetApp', 'NICS / AI Tennessee', 'Omnibond', 'Open OnDemand',
      'Pacific Northwest National Laboratory (PNNL)', 'PIER Group', 'PSC (Pittsburgh Supercomputing Center)',
      'Purdue University (RCAC)', 'San Diego Supercomputer Center (SDSC)', 'ConfidentialMind',
    ],
    'Computer Engineering and Electrical Engineering': [
      'IEEE Computer Society', 'IEEE IPDPS (International Parallel and Distributed Processing Symposium)',
      'IEEE Cluster Computing', 'ACCESS Cyberinfrastructure', 'Anvil Supercomputer', 'Open HPC',
      'TACC Undergraduate & Graduate Education', 'TACC Analysis Portal (TAP)', 'HPE (with AMD)',
      'Lenovo (with AMD)', 'Dell Technologies', 'Cornelis Networks', 'Mark III Systems', 'Cirrascale',
      'Microway', 'DataDirect Networks (DDN)',
    ],
    'Data Science, AI, Statistics, and Analytics': [
      'Black in AI', 'Google AI Professional Certificate', 'NAIRR Pilot Portal',
      'Jupyter', 'marimo', 'NRP (National Research Platform)', 'NCAR Internships',
      'Abundant Frontier Institute (AFI)', 'AI Credits Directory', 'AI Perks Free API Credits Guide (2026)',
      'AI Squared Student Program (UNIFI)', 'Anthropic', 'Cerebras Cloud (Inference API)',
      'Exa AI (Neural Search API)', 'Free AI Tools GitHub List', 'Free.ai Education',
      'GitHub Student Developer Pack', 'Google AI Studio (Gemini API)', 'Google Gemini', 'Groq Cloud',
      'Hugging Face', 'LM Studio', 'Microsoft Copilot', 'Ollama', 'OpenAI', 'OpenRouter',
      'Perplexity + Comet (1-Year Bundle)', 'Perplexity AI', 'Perplexity Pro (Education Plan)', 'Qwen',
      'StudentOffers — AI & ML Directory', 'StudentOffers — Free LLM API Proxy', 'xAI Grok API', 'Z.ai',
      'ConfidentialMind', 'NICS / AI Tennessee', 'Mark III Systems',
    ],
    'Computational, Mathematical, and Physical Sciences': [
      'DOE CSGF', 'SIAM CSI (Computing in Science and Engineering)',
      'SIAM PP (Parallel Processing for Scientific Computing)',
      'HSF Training - Singularity Container Training', 'NASA SEED', 'ACCESS Workshops',
      'Open Quantum Initiative (OQI) Undergraduate Fellowship', 'Chicago Quantum Exchange Job Board',
      'Quantum Education Landscape (RIT)', 'Quantum Learning Resources', 'Qblox',
      'SULI Program (Science Undergraduate Laboratory Internships)',
    ],
    'Biology, Biomedical, and Health Sciences': [
      'NSF REU Sites', 'NSF REU Search Tool', 'PathwaysToScience.org',
      'ACCESS Cyberinfrastructure', 'Jupyter', 'SGCI / SGX3 (Science Gateways Community Institute)',
      'SGX3 Fall & Spring Training', 'SULI Program (Science Undergraduate Laboratory Internships)',
    ],
    'Agriculture, Environmental, and Life Sciences': [
      'NCAR Internships', 'NCAR Explorer Series', 'NCAR PI-WRF Teaching Box',
      'ACCESS Cyberinfrastructure', 'Anvil Supercomputer', 'NSF REU Search Tool',
    ],
    'Geography, Planning, and Public Safety': [
      'Jupyter', 'marimo', 'ACCESS Cyberinfrastructure', 'NRP (National Research Platform)',
      'NCAR Explorer Series', 'PEARC (Practical and Extreme Computing Conference)',
    ],
    'Business, Communication, Humanities, and Social Sciences': [
      'CaRCC HR Job Family Matrix', 'ACCESS Careers', 'PathwaysToScience.org',
      'PEARC (Practical and Extreme Computing Conference)', 'HPCWire', 'Q-Ready Program',
    ],
    'General / Other': [
      'Women in HPC (WHPC)', 'Campus Research Computing Consortium (CaRCC)',
      'ACCESS Campus Champions', 'MS-CC (Minority Serving Institutions Cyberinfrastructure Consortium)',
      'NSBE (National Society of Black Engineers)',
      'SACNAS (Society for Advancement of Chicanos/Hispanics and Native Americans in Science)',
      'SHPE (Society of Hispanic Professional Engineers)', 'Latinas in STEM', 'NSF GRFP',
      'Benjamin Gilman Scholarship', 'Coalition for Academic Scientific Computation (CASC)',
      'Sustainable Horizons Institute',
    ],
  };

  // Reverse index: resource title -> set of majors it's relevant to.
  const RESOURCE_MAJORS = {};
  Object.entries(MAJOR_RESOURCE_MAP).forEach(([major, titles]) => {
    titles.forEach(title => {
      if (!RESOURCE_MAJORS[title]) RESOURCE_MAJORS[title] = [];
      RESOURCE_MAJORS[title].push(major);
    });
  });

  const state = {
    resources: [],
    categories: [],
    activeCategories: [],
    activeMajors: [],
    sortBy: 'name',
    searchTerm: '',
    mentors: [],
    speakers: [],
    selectedResources: new Set(),
  };

  // ---------- Utilities ----------

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function slugify(text) {
    return String(text || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'resource';
  }

  function normalizeUrl(url) {
    if (!url) return '';
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  }

  function extractContactName(contact) {
    if (!contact) return '';
    let name = contact.replace(/[<(][^>)]*[>)]/g, '');
    name = name.replace(/[-–]\s*[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}.*$/i, '');
    name = name.replace(/\s+/g, ' ').trim();
    return name || contact.trim();
  }

  function findMentorByName(name) {
    const normalized = name.trim().toLowerCase();
    return state.mentors.find(m => m.name.trim().toLowerCase() === normalized);
  }

  function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    toastMessage.textContent = message;
    toast.classList.remove('translate-y-24', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      toast.classList.add('translate-y-24', 'opacity-0');
      toast.classList.remove('translate-y-0', 'opacity-100');
    }, 2500);
  }

  function legacyCopy(text) {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    try { document.execCommand('copy'); } catch (e) { /* no-op */ }
    document.body.removeChild(el);
    return Promise.resolve();
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
    }
    return legacyCopy(text);
  }

  // ---------- Sharing ----------

  function buildShareUrl(slug) {
    return `${window.location.origin}${window.location.pathname}#resource-${slug}`;
  }

  function closeShareMenus(exceptSlug) {
    document.querySelectorAll('[data-share-menu]').forEach(menu => {
      if (menu.getAttribute('data-share-menu') !== exceptSlug) {
        menu.classList.add('hidden');
      }
    });
  }

  function runShareAction(action, slug, title) {
    const shareUrl = buildShareUrl(slug);

    switch (action) {
      case 'copy':
        copyToClipboard(shareUrl).then(() => showToast('Share link copied!'));
        break;
      case 'sms':
        window.location.href = `sms:?&body=${encodeURIComponent(`${title} ${shareUrl}`)}`;
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareUrl)}`;
        break;
      case 'x':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
        break;
    }
  }

  function setupSharing() {
    document.addEventListener('click', (e) => {
      const toggleBtn = e.target.closest('[data-share-toggle]');
      if (toggleBtn) {
        const slug = toggleBtn.getAttribute('data-share-toggle');
        const title = toggleBtn.getAttribute('data-share-title') || '';
        const shareUrl = buildShareUrl(slug);

        // Prefer the native share sheet (Messages, social apps, copy, etc.)
        // when the browser/OS supports it; fall back to our menu otherwise.
        if (navigator.share) {
          navigator.share({ title, url: shareUrl }).catch(() => {});
          return;
        }

        const menu = document.querySelector(`[data-share-menu="${slug}"]`);
        const wasHidden = menu.classList.contains('hidden');
        closeShareMenus(null);
        if (wasHidden) menu.classList.remove('hidden');
        return;
      }

      const actionBtn = e.target.closest('[data-share-action]');
      if (actionBtn) {
        const menu = actionBtn.closest('[data-share-menu]');
        const slug = menu.getAttribute('data-share-menu');
        const toggle = document.querySelector(`[data-share-toggle="${slug}"]`);
        const title = toggle ? toggle.getAttribute('data-share-title') || '' : '';
        runShareAction(actionBtn.getAttribute('data-share-action'), slug, title);
        closeShareMenus(null);
        return;
      }

      // Click outside any share control closes open menus.
      closeShareMenus(null);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeShareMenus(null);
    });
  }

  // ---------- Multi-resource selection & sharing ----------

  function getSelectedResourcesOrdered() {
    return state.resources.filter(r => state.selectedResources.has(r.slug));
  }

  function updateShareMultipleButton() {
    const btn = document.getElementById('share-multiple-btn');
    const count = state.selectedResources.size;
    document.getElementById('share-multiple-count').textContent = String(count);
    btn.disabled = count === 0;
    document.getElementById('clear-selected-btn').disabled = count === 0;
  }

  function clearAllSelected() {
    if (state.selectedResources.size === 0) return;
    state.selectedResources.clear();
    updateShareMultipleButton();
    renderResources();
    closeShareMultipleModal();
  }

  function shareMultipleItemRow(r) {
    return `
      <div class="border border-slate-200 rounded-lg p-4 flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="flex flex-wrap gap-1.5 mb-1.5">${r.categories.map(categoryBadge).join('')}</div>
          <h4 class="text-sm font-semibold text-pearc-navy">${escapeHtml(r.title)}</h4>
          ${r.url
            ? `<a href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer" class="text-xs text-pearc-blue hover:text-pearc-orange break-all">${escapeHtml(r.url)}</a>`
            : `<span class="text-xs text-slate-400">No link provided</span>`}
          <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">
            ${escapeHtml(r.description) || '<span class="italic text-slate-400">No description provided.</span>'}
          </p>
        </div>
        <button type="button" data-share-multiple-remove="${r.slug}" title="Remove from selection"
          class="text-slate-300 hover:text-pearc-orange text-lg leading-none shrink-0">&times;</button>
      </div>`;
  }

  function renderShareMultipleModal() {
    const list = getSelectedResourcesOrdered();
    document.getElementById('share-multiple-items').innerHTML = list.map(shareMultipleItemRow).join('');
    document.getElementById('share-multiple-modal-count').textContent = `${list.length} resource${list.length === 1 ? '' : 's'} selected`;
  }

  function openShareMultipleModal() {
    if (state.selectedResources.size === 0) return;
    renderShareMultipleModal();
    document.getElementById('share-multiple-modal').classList.remove('hidden');
  }

  function closeShareMultipleModal() {
    document.getElementById('share-multiple-modal').classList.add('hidden');
  }

  function shareMultiplePlainText(list) {
    return list.map(r => {
      const lines = [r.title];
      if (r.url) lines.push(r.url);
      lines.push(`Categories: ${r.categories.join(', ')}`);
      if (r.description) lines.push(r.description);
      return lines.join('\n');
    }).join('\n\n');
  }

  function shareMultipleMarkdown(list) {
    return list.map(r => {
      const heading = r.url ? `## [${r.title}](${r.url})` : `## ${r.title}`;
      const lines = [heading, '', `**Categories:** ${r.categories.join(', ')}`];
      if (r.description) lines.push('', r.description);
      return lines.join('\n');
    }).join('\n\n');
  }

  function csvEscape(value) {
    const str = String(value === null || value === undefined ? '' : value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  }

  function shareMultipleCsv(list) {
    const header = ['Name', 'URL', 'Categories', 'Description'];
    const rows = list.map(r => [r.title, r.url, r.categories.join('; '), r.description]);
    return [header, ...rows].map(row => row.map(csvEscape).join(',')).join('\r\n');
  }

  function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function downloadPdf(list) {
    const win = window.open('', '_blank');
    if (!win) {
      showToast('Please allow pop-ups to export as PDF.');
      return;
    }
    const rowsHtml = list.map(r => `
      <div style="border:1px solid #e2e8f0;border-radius:8px;padding:14px 16px;margin-bottom:12px;break-inside:avoid;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#4F7DA0;font-weight:600;margin-bottom:4px;">${escapeHtml(r.categories.join(' · '))}</div>
        <div style="font-size:15px;font-weight:700;color:#263543;margin-bottom:2px;">${escapeHtml(r.title)}</div>
        ${r.url ? `<div style="font-size:12px;color:#4F7DA0;margin-bottom:6px;word-break:break-all;">${escapeHtml(r.url)}</div>` : ''}
        <div style="font-size:13px;color:#475569;line-height:1.5;">${escapeHtml(r.description)}</div>
      </div>
    `).join('');
    win.document.write(`<!DOCTYPE html><html><head><title>PEARC26 HPC Resources</title>
      <meta charset="UTF-8">
      <style>body{font-family:Arial,Helvetica,sans-serif;padding:24px;color:#1e293b;} h1{font-size:18px;color:#263543;margin-bottom:16px;}</style>
      </head><body>
      <h1>PEARC26 Student Program &mdash; Selected HPC Resources</h1>
      ${rowsHtml}
      </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  }

  function setupResourceSelection() {
    document.addEventListener('change', (e) => {
      const checkbox = e.target.closest('[data-select-resource]');
      if (!checkbox) return;
      const slug = checkbox.getAttribute('data-select-resource');
      if (checkbox.checked) state.selectedResources.add(slug);
      else state.selectedResources.delete(slug);
      updateShareMultipleButton();
    });

    document.getElementById('share-multiple-btn').addEventListener('click', openShareMultipleModal);
    document.getElementById('clear-selected-btn').addEventListener('click', clearAllSelected);
    document.getElementById('share-multiple-modal-close').addEventListener('click', closeShareMultipleModal);
    document.getElementById('share-multiple-modal-backdrop').addEventListener('click', closeShareMultipleModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeShareMultipleModal();
    });

    document.getElementById('share-multiple-items').addEventListener('click', (e) => {
      const removeBtn = e.target.closest('[data-share-multiple-remove]');
      if (!removeBtn) return;
      state.selectedResources.delete(removeBtn.getAttribute('data-share-multiple-remove'));
      updateShareMultipleButton();
      renderResources();
      renderShareMultipleModal();
      if (state.selectedResources.size === 0) closeShareMultipleModal();
    });

    document.getElementById('share-multiple-pdf').addEventListener('click', () => downloadPdf(getSelectedResourcesOrdered()));
    document.getElementById('share-multiple-csv').addEventListener('click', () =>
      downloadFile('pearc26-resources.csv', shareMultipleCsv(getSelectedResourcesOrdered()), 'text/csv;charset=utf-8'));
    document.getElementById('share-multiple-markdown').addEventListener('click', () =>
      downloadFile('pearc26-resources.md', shareMultipleMarkdown(getSelectedResourcesOrdered()), 'text/markdown;charset=utf-8'));
    document.getElementById('share-multiple-copy').addEventListener('click', () => {
      copyToClipboard(shareMultiplePlainText(getSelectedResourcesOrdered())).then(() => showToast('Copied to clipboard!'));
    });
    document.getElementById('share-multiple-share').addEventListener('click', () => {
      const list = getSelectedResourcesOrdered();
      const text = shareMultiplePlainText(list);
      if (navigator.share) {
        navigator.share({ title: 'PEARC26 HPC Resources', text }).catch(() => {});
      } else {
        copyToClipboard(text).then(() => showToast('Copied to clipboard — share it anywhere!'));
      }
    });
  }

  // ---------- Resource data ----------
  // Data is parsed from _data/PEARC26-HPCResourceList-FullList.csv by Jekyll at
  // build time and embedded as JSON below, so no runtime CSV fetch/parse is needed.

  function loadResources() {
    try {
      const raw = document.getElementById('resource-data').textContent;
      const rows = JSON.parse(raw || '[]');

      state.resources = rows
        .filter(row => row.Name && row.Name.trim())
        .map(row => {
          const title = (row.Name || '').trim();
          return {
            title,
            slug: slugify(title),
            categories: (row.Category || '').split(',').map(c => c.trim()).filter(Boolean).length
              ? (row.Category || '').split(',').map(c => c.trim()).filter(Boolean)
              : ['Uncategorized'],
            description: (row.Description || '').trim(),
            url: normalizeUrl((row.URL || '').trim()),
            contact: (row['Contact Person'] || '').trim(),
            majors: RESOURCE_MAJORS[title] || [],
          };
        })
        .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));

      state.categories = Array.from(new Set(state.resources.flatMap(r => r.categories)))
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

      document.getElementById('resource-count').textContent = state.resources.length;

      updateMultiSelectLabel('category');
      updateMultiSelectLabel('major');
      renderResources();
      populateSuggestCategoryList();
      handleHashScroll();
    } catch (err) {
      console.error('Failed to load resource data:', err);
      const grid = document.getElementById('resource-grid');
      grid.innerHTML = '<p class="col-span-full text-center text-slate-400 py-16">Could not load resource data.</p>';
    }
  }

  // ---------- Multi-select filter dropdowns (category & major) ----------

  const MULTISELECT_CONFIGS = {
    category: {
      getOptions: () => state.categories,
      getSelected: () => state.activeCategories,
      setSelected: (vals) => { state.activeCategories = vals; },
      placeholder: 'Filter by category…',
    },
    major: {
      getOptions: () => Object.keys(MAJOR_RESOURCE_MAP).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })),
      getSelected: () => state.activeMajors,
      setSelected: (vals) => { state.activeMajors = vals; },
      placeholder: 'Filter by major…',
    },
  };

  function renderMultiSelectPanel(key) {
    const cfg = MULTISELECT_CONFIGS[key];
    const panel = document.querySelector(`[data-multiselect-panel="${key}"]`);
    const options = cfg.getOptions();
    const selected = cfg.getSelected();

    const clearBtn = `<button type="button" data-multiselect-clear="${key}"
        class="w-full text-left px-2 py-1.5 mb-1 text-xs font-semibold text-pearc-orange hover:text-pearc-orange-dark border-b border-slate-100 ${selected.length ? '' : 'hidden'}">
        Clear selection
      </button>`;

    const items = options.map(opt => {
      const checked = selected.includes(opt) ? 'checked' : '';
      const displayOpt = opt === EXHIBITOR_CATEGORY ? `🎪 ${opt}` : opt;
      return `<label class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer text-sm text-slate-600">
          <input type="checkbox" data-multiselect-option="${key}" value="${escapeHtml(opt)}" ${checked}
            class="rounded border-slate-300 text-pearc-orange focus:ring-pearc-orange/50">
          <span>${escapeHtml(displayOpt)}</span>
        </label>`;
    }).join('');

    panel.innerHTML = clearBtn + items;
  }

  function updateMultiSelectLabel(key) {
    const cfg = MULTISELECT_CONFIGS[key];
    const label = document.querySelector(`[data-multiselect-label="${key}"]`);
    const selected = cfg.getSelected();
    if (selected.length === 0) label.textContent = cfg.placeholder;
    else if (selected.length === 1) label.textContent = selected[0];
    else label.textContent = `${selected.length} selected`;
  }

  function closeMultiSelectPanels(exceptKey) {
    document.querySelectorAll('[data-multiselect-panel]').forEach(panel => {
      if (panel.getAttribute('data-multiselect-panel') !== exceptKey) panel.classList.add('hidden');
    });
  }

  function setupMultiSelects() {
    document.addEventListener('click', (e) => {
      const toggleBtn = e.target.closest('[data-multiselect-toggle]');
      if (toggleBtn) {
        const key = toggleBtn.getAttribute('data-multiselect-toggle');
        const panel = document.querySelector(`[data-multiselect-panel="${key}"]`);
        const wasHidden = panel.classList.contains('hidden');
        closeMultiSelectPanels(null);
        if (wasHidden) {
          renderMultiSelectPanel(key);
          panel.classList.remove('hidden');
        }
        return;
      }

      const clearBtn = e.target.closest('[data-multiselect-clear]');
      if (clearBtn) {
        const key = clearBtn.getAttribute('data-multiselect-clear');
        MULTISELECT_CONFIGS[key].setSelected([]);
        renderMultiSelectPanel(key);
        updateMultiSelectLabel(key);
        renderResources();
        return;
      }

      if (!e.target.closest('[data-multiselect-panel]')) {
        closeMultiSelectPanels(null);
      }
    });

    document.addEventListener('change', (e) => {
      const checkbox = e.target.closest('[data-multiselect-option]');
      if (!checkbox) return;
      const key = checkbox.getAttribute('data-multiselect-option');
      const cfg = MULTISELECT_CONFIGS[key];
      const selected = new Set(cfg.getSelected());
      if (checkbox.checked) selected.add(checkbox.value); else selected.delete(checkbox.value);
      cfg.setSelected(Array.from(selected));

      const panel = document.querySelector(`[data-multiselect-panel="${key}"]`);
      const clearBtn = panel.querySelector(`[data-multiselect-clear="${key}"]`);
      clearBtn.classList.toggle('hidden', cfg.getSelected().length === 0);

      updateMultiSelectLabel(key);
      renderResources();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMultiSelectPanels(null);
    });

    Object.keys(MULTISELECT_CONFIGS).forEach(key => updateMultiSelectLabel(key));
  }

  // ---------- Rendering: Sort dropdown ----------

  function setupSortFilter() {
    const select = document.getElementById('sort-filter');
    select.value = state.sortBy;
    select.addEventListener('change', () => {
      state.sortBy = select.value;
      renderResources();
    });
  }

  function sortResources(list) {
    const sorted = list.slice();
    if (state.sortBy === 'category') {
      sorted.sort((a, b) => {
        const catCompare = a.categories[0].localeCompare(b.categories[0], undefined, { sensitivity: 'base' });
        return catCompare !== 0 ? catCompare : a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
      });
    } else {
      sorted.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
    }
    return sorted;
  }

  // ---------- Rendering: Resource cards ----------

  function filteredResources() {
    const term = state.searchTerm.toLowerCase().trim();
    const list = state.resources.filter(r => {
      const matchesCategory = state.activeCategories.length === 0 || r.categories.some(c => state.activeCategories.includes(c));
      if (!matchesCategory) return false;
      const matchesMajor = state.activeMajors.length === 0 || r.majors.some(m => state.activeMajors.includes(m));
      if (!matchesMajor) return false;
      if (!term) return true;
      return (
        r.title.toLowerCase().includes(term) ||
        r.categories.some(c => c.toLowerCase().includes(term)) ||
        r.description.toLowerCase().includes(term)
      );
    });
    return sortResources(list);
  }

  function renderResources() {
    const grid = document.getElementById('resource-grid');
    const emptyState = document.getElementById('empty-state');
    const summary = document.getElementById('results-summary');
    const list = filteredResources();

    summary.textContent = `Showing ${list.length} of ${state.resources.length} resources`;

    if (list.length === 0) {
      grid.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }
    emptyState.classList.add('hidden');

    grid.innerHTML = list.map(cardTemplate).join('');
  }

  const EXHIBITOR_CATEGORY = 'PEARC EXHIBITOR';

  function categoryBadgeClasses(category) {
    return category === EXHIBITOR_CATEGORY
      ? 'text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 border-transparent shadow-sm'
      : 'text-pearc-blue-dark bg-blue-50 border-blue-200';
  }

  function categoryBadge(category) {
    const isExhibitor = category === EXHIBITOR_CATEGORY;
    return `<span class="text-[11px] uppercase tracking-wide font-semibold rounded px-2.5 py-1 shrink-0 border ${categoryBadgeClasses(category)}">
        ${isExhibitor ? '🎪 ' : ''}${escapeHtml(category)}
      </span>`;
  }

  function cardTemplate(resource) {
    const slug = resource.slug;
    const hasContact = Boolean(resource.contact);
    const hasUrl = Boolean(resource.url);
    const isExhibitor = resource.categories.includes(EXHIBITOR_CATEGORY);
    const isSelected = state.selectedResources.has(slug);

    const borderClasses = hasContact
      ? 'border-l-4 border-l-pearc-orange border-t border-r border-b border-slate-200'
      : isExhibitor
      ? 'border-l-4 border-l-violet-500 border-t border-r border-b border-slate-200'
      : 'border border-slate-200';

    let contactHtml = '';
    if (hasContact) {
      const contactName = extractContactName(resource.contact);
      const mentor = findMentorByName(contactName);
      const nameHtml = mentor
        ? `<a href="#mentor-${mentor.slug}" data-mentor-link="${mentor.slug}" class="text-pearc-blue hover:text-pearc-orange font-medium underline underline-offset-2">${escapeHtml(contactName)}</a>`
        : `<span class="text-slate-600 font-medium">${escapeHtml(contactName)}</span>`;

      contactHtml = `<div class="mt-3 flex items-center gap-2">
          <span class="mentorship-badge inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-pearc-orange-dark bg-orange-50 border border-orange-200 rounded-full px-2.5 py-1">
            ⚡ Mentorship Available
          </span>
        </div>
        <p class="mt-2 text-xs text-slate-500">${nameHtml}</p>`;
    }

    const launchBtn = hasUrl
      ? `<a href="${escapeHtml(resource.url)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(resource.url)}"
           class="bg-pearc-orange hover:bg-pearc-orange-dark text-white text-xs font-semibold px-3.5 py-2 rounded-md shadow-sm transition truncate min-w-0 max-w-full">
           ${escapeHtml(resource.url)} ↗
         </a>`
      : `<span class="text-xs text-slate-400">No link provided</span>`;

    return `
      <article id="resource-${slug}" tabindex="-1"
        class="group relative rounded-xl bg-white shadow-sm p-5 flex flex-col justify-between hover:shadow-md hover:border-pearc-blue/50 transition ${borderClasses}">
        <div>
          <div class="flex items-start justify-between gap-2 mb-2">
            <div class="flex flex-wrap gap-1.5">
              ${resource.categories.map(categoryBadge).join('')}
            </div>
            <div class="flex items-center gap-2.5 shrink-0">
              <label class="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-pearc-blue cursor-pointer select-none" title="Select for sharing">
                <input type="checkbox" data-select-resource="${slug}" ${isSelected ? 'checked' : ''}
                  class="rounded border-slate-300 text-pearc-orange focus:ring-pearc-orange/50 w-3.5 h-3.5 cursor-pointer">
              </label>
              <div class="relative">
                <button type="button" data-share-toggle="${slug}" data-share-title="${escapeHtml(resource.title)}" title="Share this resource"
                  class="text-[11px] font-medium text-slate-400 hover:text-pearc-orange transition flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3 shrink-0" aria-hidden="true"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                  Share
                </button>
                <div data-share-menu="${slug}" class="hidden absolute right-0 top-6 z-20 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 text-xs">
                  <button type="button" data-share-action="copy" class="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-600 flex items-center gap-2">📋 Copy link</button>
                  <button type="button" data-share-action="sms" class="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-600 flex items-center gap-2">💬 Text message</button>
                  <button type="button" data-share-action="email" class="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-600 flex items-center gap-2">✉️ Email</button>
                  <div class="my-1 border-t border-slate-100"></div>
                  <button type="button" data-share-action="x" class="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-600 flex items-center gap-2">𝕏 Share on X</button>
                  <button type="button" data-share-action="linkedin" class="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-600 flex items-center gap-2">💼 Share on LinkedIn</button>
                  <button type="button" data-share-action="facebook" class="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-600 flex items-center gap-2">📘 Share on Facebook</button>
                </div>
              </div>
            </div>
          </div>

          <h3 class="flex items-center gap-2 text-base font-semibold text-pearc-navy mb-1.5 leading-snug">
            <img src="${escapeHtml(SITE_BASEURL + '/assets/favicons/resources/' + resource.slug + '.svg')}" alt="" loading="lazy"
              class="w-4 h-4 shrink-0 object-contain rounded-sm" onerror="this.remove()">
            <span>${escapeHtml(resource.title)}</span>
          </h3>

          <p tabindex="0" class="clamp-desc text-sm text-slate-500 leading-relaxed outline-none">
            ${escapeHtml(resource.description) || '<span class="italic text-slate-400">No description provided.</span>'}
          </p>

          ${contactHtml}
        </div>

        <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          ${launchBtn}
        </div>
      </article>
    `;
  }

  // ---------- Mentors tab ----------
  // Data is parsed from _data/mentors.csv by Jekyll at build time and embedded
  // as JSON below, so no runtime CSV fetch/parse is needed.

  function loadMentors() {
    try {
      const raw = document.getElementById('mentor-data').textContent;
      const rows = JSON.parse(raw || '[]');

      state.mentors = rows
        .filter(row => row.Name && row.Name.trim())
        .map(row => {
          const name = (row.Name || '').trim();
          return {
            name,
            slug: slugify(name),
            affiliation: (row.Affiliation || '').trim(),
            affiliationUrl: normalizeUrl((row['Affiliation URL'] || '').trim()),
            roleUrl: normalizeUrl((row['Role URL'] || '').trim()),
            linkedin: normalizeUrl((row.LinkedIn || '').trim()),
            focus: (row.Focus || '').trim(),
            email: (row.Email || '').trim(),
          };
        });
    } catch (err) {
      console.error('Failed to load mentor data:', err);
      state.mentors = [];
    }
    renderMentors();
  }

  function affiliationLink(text, url) {
    return url
      ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="hover:text-pearc-orange transition">${escapeHtml(text)}</a>`
      : escapeHtml(text);
  }

  function mentorAffiliationHtml(m) {
    const sepIndex = m.affiliation.indexOf(' · ');
    if (sepIndex === -1) return affiliationLink(m.affiliation, m.affiliationUrl);
    const orgPart = m.affiliation.slice(0, sepIndex);
    const rolePart = m.affiliation.slice(sepIndex + 3);
    return `${affiliationLink(orgPart, m.affiliationUrl)} · ${affiliationLink(rolePart, m.roleUrl)}`;
  }

  function renderMentors() {
    const grid = document.getElementById('mentor-grid');
    document.getElementById('mentor-count').textContent = `${state.mentors.length} verified`;
    grid.innerHTML = state.mentors.map(m => `
      <div id="mentor-${m.slug}" tabindex="-1" class="rounded-xl border border-slate-200 bg-white shadow-sm p-5 hover:border-pearc-blue/50 hover:shadow-md transition">
        <div class="flex items-center justify-between gap-2 mb-2">
          <h3 class="text-sm font-semibold text-pearc-navy">${escapeHtml(m.name)}</h3>
          <span class="text-[10px] uppercase tracking-wide font-bold text-pearc-blue-dark bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5 shrink-0">Verified</span>
        </div>
        <p class="text-xs text-slate-500 mb-1">${mentorAffiliationHtml(m)}</p>
        <p class="text-[11px] text-slate-400 mb-4">${escapeHtml(m.focus)}</p>
        <div class="flex items-center gap-4">
          <a href="${escapeHtml(m.linkedin)}" target="_blank" rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 text-xs font-semibold text-pearc-orange hover:text-pearc-orange-dark transition">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5 shrink-0" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            Connect on LinkedIn ↗
          </a>
          ${m.email ? `<a href="mailto:${escapeHtml(m.email)}?subject=${encodeURIComponent('[PEARC26 Student Program]')}" class="inline-flex items-center gap-1.5 text-xs font-semibold text-pearc-blue hover:text-pearc-blue-dark transition">✉️ Email</a>` : ''}
        </div>
      </div>
    `).join('');
  }

  // ---------- Speakers tab (Groundwork for Greatness) ----------
  // Data is parsed from _data/speakers.yml by Jekyll at build time and
  // embedded as JSON below, so no runtime YAML fetch/parse is needed.

  function speakerInitials(name) {
    return String(name || '')
      .replace(/^Dr\.?\s+/i, '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0].toUpperCase())
      .join('');
  }

  function affiliationMark(a) {
    if (a.icon) return `<img src="${escapeHtml(SITE_BASEURL + a.icon)}" alt="" class="inline-block w-3.5 h-3.5 align-[-2px] mr-1">`;
    if (a.emoji) return `<span class="mr-1" aria-hidden="true">${escapeHtml(a.emoji)}</span>`;
    return '';
  }

  function affiliationsHtml(affiliations) {
    return (affiliations || [])
      .map(a => {
        const label = affiliationMark(a) + escapeHtml(a.name);
        return a.url
          ? `<a href="${escapeHtml(a.url)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center hover:text-pearc-orange transition">${label}</a>`
          : `<span class="inline-flex items-center">${label}</span>`;
      })
      .join(' <span class="mx-1">·</span> ');
  }

  function bioParagraphs(bio) {
    return String(bio || '')
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => `<p>${escapeHtml(p)}</p>`)
      .join('');
  }

  function speakerCard(speaker) {
    return `
      <article class="rounded-xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8">
        <div class="flex flex-col sm:flex-row sm:items-start gap-5">
          <div class="shrink-0 w-16 h-16 rounded-full brand-bar flex items-center justify-center text-white font-bold text-lg overflow-hidden">
            ${speaker.photo
              ? `<img src="${escapeHtml(SITE_BASEURL + speaker.photo)}" alt="${escapeHtml(speaker.name)}" class="w-full h-full object-cover">`
              : escapeHtml(speakerInitials(speaker.name))}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 class="text-lg font-bold text-pearc-navy">${escapeHtml(speaker.name)}</h3>
              <span class="text-xs font-semibold text-pearc-blue-dark bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1 whitespace-nowrap">
                ${escapeHtml(speaker.session)}
              </span>
            </div>
            <p class="text-sm text-slate-600 font-medium mt-0.5">${escapeHtml(speaker.title)}</p>
            <p class="text-xs text-slate-400 mb-4">${affiliationsHtml(speaker.affiliations)}</p>

            <div class="flex items-center gap-4 mb-5">
              ${speaker.linkedin ? `<a href="${escapeHtml(speaker.linkedin)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-xs font-semibold text-pearc-orange hover:text-pearc-orange-dark transition"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5 shrink-0" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>Connect on LinkedIn ↗</a>` : ''}
              ${speaker.email ? `<a href="mailto:${escapeHtml(speaker.email)}?subject=${encodeURIComponent('[PEARC26 Student Program]')}" class="inline-flex items-center gap-1.5 text-xs font-semibold text-pearc-blue hover:text-pearc-blue-dark transition">✉️ Email</a>` : ''}
            </div>

            <div class="bio text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
              ${bioParagraphs(speaker.bio)}
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function loadSpeakers() {
    const list = document.getElementById('speaker-list');
    try {
      const raw = document.getElementById('speaker-data').textContent;
      state.speakers = JSON.parse(raw || '[]');
      list.innerHTML = state.speakers.map(speakerCard).join('');
    } catch (err) {
      console.error('Failed to load speaker data:', err);
      list.innerHTML = '<p class="text-center text-slate-400 py-16">Could not load speaker data.</p>';
    }
  }

  function buildGithubIssueUrl(title, bodyLines, labels) {
    const params = new URLSearchParams();
    params.set('title', title);
    params.set('body', bodyLines.join('\n'));
    if (labels) params.set('labels', labels);
    return `https://github.com/${GITHUB_REPO}/issues/new?${params.toString()}`;
  }

  function setupMentorForm() {
    const form = document.getElementById('mentor-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('m-name').value.trim();
      const email = document.getElementById('m-email').value.trim();
      const institution = document.getElementById('m-institution').value.trim();
      const linkedin = document.getElementById('m-linkedin').value.trim();

      const body = [
        '**New Mentor Submission**',
        '',
        `- **Full Name:** ${name}`,
        `- **Email Address:** ${email}`,
        `- **Institution / Affiliation:** ${institution}`,
        `- **LinkedIn Profile:** ${linkedin}`,
        '',
        '_Submitted via the PEAR26 Student Program HPC Resource Directory mentor form._',
      ];

      const issueUrl = buildGithubIssueUrl(`[Mentor Signup] ${name}`, body, 'mentor-signup');
      window.open(issueUrl, '_blank', 'noopener,noreferrer');
      form.reset();
      showToast('Opening GitHub to finish your submission…');
    });
  }

  // ---------- FAQ support form ----------

  function setupSupportForm() {
    const form = document.getElementById('support-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const subject = document.getElementById('faq-subject').value.trim();
      const details = document.getElementById('faq-details').value.trim();
      const email = document.getElementById('faq-email').value.trim();

      const body = [
        '**New Support Question**',
        '',
        `- **Question:** ${subject}`,
        `- **Contact Email (optional):** ${email}`,
        '',
        '**Details**',
        details,
        '',
        '_Submitted via the PEAR26 Student Program HPC Resource Directory FAQ tab._',
      ];

      const issueUrl = buildGithubIssueUrl(`[Support Question] ${subject}`, body, 'support-question');
      window.open(issueUrl, '_blank', 'noopener,noreferrer');
      form.reset();
      showToast('Opening GitHub to finish your submission…');
    });
  }

  // ---------- Suggest a Resource modal ----------

  function openSuggestModal() {
    const modal = document.getElementById('suggest-modal');
    modal.classList.remove('hidden');
    document.getElementById('s-title').focus();
  }

  function closeSuggestModal() {
    document.getElementById('suggest-modal').classList.add('hidden');
  }

  function populateSuggestCategoryList() {
    const datalist = document.getElementById('suggest-category-list');
    datalist.innerHTML = state.categories.map(cat => `<option value="${escapeHtml(cat)}"></option>`).join('');
  }

  function setupSuggestResourceButton() {
    document.getElementById('suggest-resource-btn').addEventListener('click', openSuggestModal);
    document.getElementById('suggest-modal-close').addEventListener('click', closeSuggestModal);
    document.getElementById('suggest-modal-backdrop').addEventListener('click', closeSuggestModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSuggestModal();
    });

    const form = document.getElementById('suggest-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('s-title').value.trim();
      const category = document.getElementById('s-category').value.trim();
      const url = document.getElementById('s-url').value.trim();
      const description = document.getElementById('s-description').value.trim();
      const contact = document.getElementById('s-contact').value.trim();

      const body = [
        '**New Resource Suggestion**',
        '',
        `- **Title:** ${title}`,
        `- **Category:** ${category}`,
        `- **URL:** ${url}`,
        `- **Contact Person (optional):** ${contact}`,
        '',
        '**Description**',
        description,
        '',
        '_Submitted via the PEAR26 Student Program HPC Resource Directory._',
      ];

      const issueUrl = buildGithubIssueUrl(`[Resource Suggestion] ${title}`, body, 'resource-suggestion');
      window.open(issueUrl, '_blank', 'noopener,noreferrer');
      form.reset();
      closeSuggestModal();
      showToast('Opening GitHub to finish your submission…');
    });
  }

  // ---------- Tabs ----------

  function activateTab(target) {
    document.querySelectorAll('.tab-btn').forEach(b => {
      const isActive = b.getAttribute('data-tab') === target;
      b.setAttribute('aria-selected', String(isActive));
      b.classList.toggle('text-pearc-navy', isActive);
      b.classList.toggle('border-pearc-orange', isActive);
      b.classList.toggle('text-slate-400', !isActive);
      b.classList.toggle('border-transparent', !isActive);
    });

    document.getElementById('tab-directory').classList.toggle('hidden', target !== 'directory');
    document.getElementById('tab-mentors').classList.toggle('hidden', target !== 'mentors');
    document.getElementById('tab-speakers').classList.toggle('hidden', target !== 'speakers');
    document.getElementById('tab-faq').classList.toggle('hidden', target !== 'faq');
  }

  function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab');
        activateTab(target);
        history.replaceState(null, '', `#${target}`);
      });
    });
  }

  // ---------- Contact person -> mentor profile links ----------

  function goToMentor(slug) {
    activateTab('mentors');
    history.replaceState(null, '', `#mentor-${slug}`);
    setTimeout(() => {
      const el = document.getElementById(`mentor-${slug}`);
      if (el) scrollToAndGlow(el);
    }, 100);
  }

  function setupContactLinks() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-mentor-link]');
      if (!link) return;
      e.preventDefault();
      goToMentor(link.getAttribute('data-mentor-link'));
    });
  }

  // ---------- Search ----------

  function setupSearch() {
    const input = document.getElementById('search-input');
    input.addEventListener('input', () => {
      state.searchTerm = input.value;
      renderResources();
    });
  }

  // ---------- Deep-link hash scroll ----------

  function scrollToAndGlow(el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('hash-target');
    setTimeout(() => el.classList.remove('hash-target'), 2300);
  }

  function handleHashScroll() {
    const hash = window.location.hash;
    if (!hash) return;

    // A bare "#<data-tab value>" (e.g. #mentors, #faq) is a direct link to
    // that tab — matched generically against existing tab-panel ids so a
    // future fifth tab needs no change here.
    const bareTabId = hash.slice(1);
    const tabPanel = document.getElementById(`tab-${bareTabId}`);
    if (tabPanel && tabPanel.classList.contains('tab-panel')) {
      activateTab(bareTabId);
      return;
    }

    if (hash.startsWith('#resource-')) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) scrollToAndGlow(el);
      }, 150);
    } else if (hash.startsWith('#mentor-')) {
      activateTab('mentors');
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) scrollToAndGlow(el);
      }, 150);
    }
  }

  // ---------- Init ----------

  document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    setupSearch();
    setupMultiSelects();
    setupSortFilter();
    setupSharing();
    setupResourceSelection();
    setupContactLinks();
    setupMentorForm();
    setupSuggestResourceButton();
    setupSupportForm();
    loadMentors();
    loadResources();
    loadSpeakers();
  });

  window.addEventListener('load', handleHashScroll);
  window.addEventListener('hashchange', handleHashScroll);
})();
