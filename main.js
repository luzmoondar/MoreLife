document.addEventListener('DOMContentLoaded', () => {
    const mainMenuItems = document.querySelectorAll('#main-menu li');
    const subMenus = document.querySelectorAll('.sub-menu');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // ============================================================
    //  Hamburger Menu / Mobile Drawer
    // ============================================================
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const drawerCloseBtn = document.getElementById('drawer-close-btn');
    const mobileMenuItems = document.querySelectorAll('#mobile-main-menu li');

    function openDrawer() {
        mobileDrawer.classList.add('open');
        mobileOverlay.classList.add('active');
        hamburgerBtn.classList.add('open');
        hamburgerBtn.setAttribute('aria-expanded', 'true');
        mobileDrawer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        mobileDrawer.classList.remove('open');
        mobileOverlay.classList.remove('active');
        hamburgerBtn.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        mobileDrawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', openDrawer);
    if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
    if (mobileOverlay) mobileOverlay.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) closeDrawer();
    });

    // 모바일 메뉴 클릭 → 탭 전환 후 드로어 닫기
    mobileMenuItems.forEach(mItem => {
        mItem.addEventListener('click', () => {
            const targetMenu = mItem.getAttribute('data-menu');

            // 모바일 메뉴 active 업데이트
            mobileMenuItems.forEach(m => m.classList.remove('active'));
            mItem.classList.add('active');

            // 데스크탑 메뉴도 동기화
            mainMenuItems.forEach(m => {
                m.classList.toggle('active', m.getAttribute('data-menu') === targetMenu);
            });

            // 서브메뉴 & 탭 전환
            subMenus.forEach(sm => sm.classList.remove('active'));
            const activeSubMenu = document.getElementById(`sub-menu-${targetMenu}`);
            if (activeSubMenu) {
                activeSubMenu.classList.add('active');
                const firstSubItem = activeSubMenu.querySelector('li');
                if (firstSubItem) firstSubItem.click();
            }

            closeDrawer();
        });
    });

    // Custom Tooltip Initialization
    const globalTooltip = document.createElement('div');
    globalTooltip.className = 'custom-tooltip';
    document.body.appendChild(globalTooltip);

    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest('.cal-issue-badge');
        if (target && target.dataset.title) {
            globalTooltip.textContent = target.dataset.title;
            globalTooltip.classList.add('visible');
            const rect = target.getBoundingClientRect();
            // Position above the badge
            globalTooltip.style.left = `${rect.left + rect.width / 2}px`;
            globalTooltip.style.top = `${rect.top - 6}px`; // gap above
        }
    });

    document.addEventListener('mouseout', (e) => {
        const target = e.target.closest('.cal-issue-badge');
        if (target) {
            globalTooltip.classList.remove('visible');
        }
    });

    // Main Menu Click Event
    mainMenuItems.forEach(item => {
        item.addEventListener('click', () => {
            // Update active state in main menu
            mainMenuItems.forEach(m => m.classList.remove('active'));
            item.classList.add('active');

            // Find target sub-menu to display
            const targetMenu = item.getAttribute('data-menu');
            subMenus.forEach(sm => sm.classList.remove('active'));
            const activeSubMenu = document.getElementById(`sub-menu-${targetMenu}`);
            if (activeSubMenu) {
                activeSubMenu.classList.add('active');
                
                // Automatically click the first tab of newly visible sub-menu
                const firstSubItem = activeSubMenu.querySelector('li');
                if (firstSubItem) {
                    firstSubItem.click();
                }
            }
        });
    });

    // Sub Menu Click Event
    const subMenuItems = document.querySelectorAll('.sub-menu li');
    subMenuItems.forEach(item => {
        item.addEventListener('click', () => {
            // Update active state in corresponding sub-menu
            const parent = item.parentElement;
            parent.querySelectorAll('li').forEach(sm => sm.classList.remove('active'));
            item.classList.add('active');

            // Show corresponding content tab pane
            const targetTab = item.getAttribute('data-tab');
            tabPanes.forEach(tp => tp.classList.remove('active'));
            
            const tabElement = document.getElementById(targetTab);
            if(tabElement) {
                tabElement.classList.add('active');
                if (targetTab === 'personal-ledger' && typeof renderPersonalLedger === 'function') {
                    renderPersonalLedger();
                }
            }
        });
    });

    // Year selector in Yearly Issue
    const prevYearBtn = document.querySelector('.prev-year');
    const nextYearBtn = document.querySelector('.next-year');
    const currentYearEl = document.querySelector('.current-year');

    function renderYearlyIssues() {
        if (!currentYearEl) return;
        const currentYear = parseInt(currentYearEl.textContent);
        const monthBoxes = document.querySelectorAll('.month-box');
        if (!monthBoxes.length) return;
        
        const today = new Date();
        
        monthBoxes.forEach((box, index) => {
            const contentDiv = box.querySelector('.month-content');
            if(contentDiv) contentDiv.innerHTML = '';
            
            const titleDiv = box.querySelector('.month-title');
            if (titleDiv) {
                if (currentYear === today.getFullYear() && index === today.getMonth()) {
                    titleDiv.classList.add('current-month');
                } else {
                    titleDiv.classList.remove('current-month');
                }
            }
        });
        
        // Sort issues by date
        const sortedIssues = [...globalIssues].sort((a,b) => a.startDate.localeCompare(b.startDate));
        
        sortedIssues.forEach(issue => {
            const sDate = new Date(issue.startDate);
            if(sDate.getFullYear() === currentYear) {
                const month = sDate.getMonth(); // 0-11
                if (month >= 0 && month < 12) {
                    const contentDiv = monthBoxes[month].querySelector('.month-content');
                    if (contentDiv) {
                        const item = document.createElement('div');
                        item.style.marginBottom = '0.5rem';
                        item.style.fontSize = '0.85rem';
                        item.style.color = 'var(--color-gray-dark)';
                        item.style.paddingLeft = '0.6rem';
                        item.style.position = 'relative';
                        
                        const dot = document.createElement('span');
                        dot.style.position = 'absolute';
                        dot.style.left = '0';
                        dot.style.color = 'var(--color-main)';
                        dot.innerHTML = '&bull;';
                        
                        const s = issue.startDate.split('-');
                        const e = issue.endDate.split('-');
                        const sMon = parseInt(s[1]), sDay = parseInt(s[2]);
                        const eMon = parseInt(e[1]), eDay = parseInt(e[2]);
                        let dateStr = `${sMon}.${sDay}`;
                        if (issue.startDate !== issue.endDate) {
                            if (sMon === eMon) dateStr += `~${eDay}`;
                            else dateStr += `~${eMon}.${eDay}`;
                        }

                        const dateSpan = document.createElement('span');
                        dateSpan.textContent = dateStr;
                        dateSpan.style.fontWeight = '700';
                        dateSpan.style.marginLeft = '0.2rem';
                        dateSpan.style.marginRight = '0.3rem';
                        
                        // 현재 날짜의 연도, 달과 일치하는 월 상자인지 검사 (오늘 기준 '이번 달' 강조)
                        if (currentYear === today.getFullYear() && month === today.getMonth()) {
                            dateSpan.style.color = 'var(--color-main)';
                        } else {
                            dateSpan.style.color = 'var(--color-gray-text)';
                        }

                        const textObj = document.createElement('span');
                        textObj.textContent = issue.text;

                        item.appendChild(dot);
                        
                        if (issue.owner) {
                            let cClass = 'color-1';
                            if (issue.owner === '부부') cClass = 'color-2';
                            else if (issue.owner === '지원') cClass = 'color-3';
                            const tag = document.createElement('span');
                            tag.className = `owner-tag ${cClass}`;
                            tag.textContent = issue.owner;
                            item.appendChild(tag);
                        }
                        
                        item.appendChild(dateSpan);
                        item.appendChild(textObj);
                        contentDiv.appendChild(item);
                    }
                }
            }
        });
    }

    if(prevYearBtn && nextYearBtn && currentYearEl) {
        let currentYearObj = new Date().getFullYear();
        currentYearEl.textContent = `${currentYearObj}년`;
        
        prevYearBtn.addEventListener('click', () => {
            currentYearObj--;
            currentYearEl.textContent = `${currentYearObj}년`;
            renderYearlyIssues();
        });
        
        nextYearBtn.addEventListener('click', () => {
            currentYearObj++;
            currentYearEl.textContent = `${currentYearObj}년`;
            renderYearlyIssues();
        });
    }

    // Monthly Issue Logic
    const calendarDays = document.getElementById('calendar-days');
    const currentMonthYearEl = document.getElementById('current-month-year');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const issueForm = document.getElementById('issue-form');
    const issueStartDateInput = document.getElementById('issue-start-date');
    const issueEndDateInput = document.getElementById('issue-end-date');
    const issueTextInput = document.getElementById('issue-text');
    const issueList = document.getElementById('issue-list');

    // Handle owner selector active state
    const ownerLabels = document.querySelectorAll('.owner-label');
    ownerLabels.forEach(label => {
        const radio = label.querySelector('input[type="radio"]');
        radio.addEventListener('change', () => {
            ownerLabels.forEach(l => l.classList.remove('active'));
            if(radio.checked) {
                label.classList.add('active');
            }
        });
    });

    // color cycler for badges
    const badgeColors = ['color-1', 'color-2', 'color-3'];

    let globalIssues = JSON.parse(localStorage.getItem('morelife_issues')) || [];
    let issueIdCounter = parseInt(localStorage.getItem('morelife_issueIdCounter')) || 1;
    let editingIssueId = null;

    function saveIssuesToLocalStorage() {
        localStorage.setItem('morelife_issues', JSON.stringify(globalIssues));
        localStorage.setItem('morelife_issueIdCounter', issueIdCounter.toString());
        if (typeof renderYearlyIssues === 'function') renderYearlyIssues();
    }

    let calDate = new Date();

    if(calendarDays && currentMonthYearEl) {
        function renderCalendar() {
            const year = calDate.getFullYear();
            const month = calDate.getMonth();
            
            currentMonthYearEl.textContent = `${year}년 ${month + 1}월`;
            calendarDays.innerHTML = '';

            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            for (let i = 0; i < firstDay; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.className = 'cal-day empty';
                calendarDays.appendChild(emptyCell);
            }

            const today = new Date();
            
            for (let d = 1; d <= daysInMonth; d++) {
                const dayCell = document.createElement('div');
                dayCell.className = 'cal-day';
                
                if (year === today.getFullYear() && month === today.getMonth() && d === today.getDate()) {
                    dayCell.classList.add('today');
                }

                const dayNum = document.createElement('div');
                dayNum.className = 'cal-day-num';
                dayNum.textContent = d;
                dayCell.appendChild(dayNum);

                const dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
                
                dayCell.addEventListener('click', () => {
                    issueStartDateInput.value = dateString;
                    issueEndDateInput.value = dateString;
                    issueTextInput.focus();
                });

                // Calculate dayOfWeek for edge rounding logic
                const dayOfWeek = new Date(year, month, d).getDay();

                // Check issues covering this day
                const todaysIssues = globalIssues.filter(i => {
                    return dateString >= i.startDate && dateString <= i.endDate;
                });
                
                todaysIssues.forEach((issue, index) => {
                    const badge = document.createElement('div');
                    let colorClass = 'color-1'; // 태웅 default
                    if (issue.owner === '부부') colorClass = 'color-2';
                    else if (issue.owner === '지원') colorClass = 'color-3';
                    else if (!issue.owner) colorClass = badgeColors[issue.id % 3]; // Legacy fallback

                    badge.className = `cal-issue-badge ${colorClass}`;
                    
                    const fullText = issue.owner ? `${issue.owner}: ${issue.text}` : issue.text;
                    badge.dataset.title = fullText; // 커스텀 툴팁 정보

                    if (issue.startDate !== issue.endDate) {
                        if (dateString === issue.startDate) {
                            badge.classList.add('span-start');
                        } else if (dateString === issue.endDate) {
                            badge.classList.add('span-end');
                        } else {
                            badge.classList.add('span-mid');
                        }
                        
                        if (dayOfWeek === 0) badge.classList.add('week-start');
                        if (dayOfWeek === 6) badge.classList.add('week-end');
                        
                        // 텍스트는 시작일이거나 달의 첫 날, 또는 주의 시작(일요일)일 때 표시합니다.
                        const showText = (dateString === issue.startDate || dayOfWeek === 0 || d === 1);
                        badge.textContent = showText ? fullText : '\u00A0';
                    } else {
                        badge.textContent = fullText;
                    }

                    dayCell.appendChild(badge);
                });

                calendarDays.appendChild(dayCell);
            }
            
            renderIssueList();
        }

        function renderIssueList() {
            issueList.innerHTML = '';
            
            const year = calDate.getFullYear();
            const month = calDate.getMonth() + 1;
            const monthString = `${year}-${month.toString().padStart(2, '0')}`;

            // get issues that overlap with current month visually
            const currentMonthIssues = globalIssues.filter(i => {
                return i.startDate.startsWith(monthString) || i.endDate.startsWith(monthString);
            }).sort((a,b) => a.startDate.localeCompare(b.startDate));
            
            if(currentMonthIssues.length === 0) {
                const li = document.createElement('li');
                li.style.color = '#94a3b8';
                li.style.textAlign = 'center';
                li.style.padding = '2rem 0';
                li.textContent = '이번 달 등록된 이슈가 없습니다.';
                issueList.appendChild(li);
                return;
            }

            currentMonthIssues.forEach(issue => {
                const s = issue.startDate.split('-');
                const e = issue.endDate.split('-');
                
                const sMon = parseInt(s[1]), sDay = parseInt(s[2]);
                const eMon = parseInt(e[1]), eDay = parseInt(e[2]);
                let displayDate = `${sMon}.${sDay}`;
                if(issue.startDate !== issue.endDate) {
                    if (sMon === eMon) displayDate += `~${eDay}`;
                    else displayDate += `~${eMon}.${eDay}`;
                }

                let ownerTag = '';
                if (issue.owner) {
                    let cClass = 'color-1';
                    if (issue.owner === '부부') cClass = 'color-2';
                    else if (issue.owner === '지원') cClass = 'color-3';
                    ownerTag = `<span class="owner-tag ${cClass}">${issue.owner}</span>`;
                }

                const li = document.createElement('li');
                li.className = 'modern-issue-item';
                li.innerHTML = `
                    <div class="custom-checkbox-wrap">
                        <input type="checkbox" class="custom-checkbox" ${issue.done ? 'checked' : ''} data-id="${issue.id}">
                    </div>
                    <div class="item-content">
                        <span class="item-title-text" style="${issue.done ? 'text-decoration: line-through; color: #94a3b8;' : ''}">
                            ${ownerTag}
                            <span class="item-date-text" style="display:inline; margin: 0 0.4rem; font-weight: 700;">${displayDate}</span>
                            ${issue.text}
                        </span>
                    </div>
                    <div class="item-actions">
                        <button class="btn-pill btn-edit" data-id="${issue.id}">수정</button>
                        <button class="btn-pill btn-delete" data-id="${issue.id}">삭제</button>
                    </div>
                `;
                issueList.appendChild(li);
            });

            // Bind delete events
            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idToDelete = parseInt(e.target.getAttribute('data-id'));
                    globalIssues = globalIssues.filter(i => i.id !== idToDelete);
                    saveIssuesToLocalStorage();
                    renderCalendar();
                });
            });

            // Bind edit events
            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idToEdit = parseInt(e.target.getAttribute('data-id'));
                    const issue = globalIssues.find(i => i.id === idToEdit);
                    if(issue) {
                        editingIssueId = issue.id;
                        
                        issueStartDateInput.value = issue.startDate;
                        issueEndDateInput.value = issue.endDate;
                        issueTextInput.value = issue.text;
                        
                        if(issue.owner) {
                            const radioToSelect = document.querySelector(`input[name="issueOwner"][value="${issue.owner}"]`);
                            if(radioToSelect) {
                                radioToSelect.checked = true;
                                document.querySelectorAll('.owner-label').forEach(l => l.classList.remove('active'));
                                radioToSelect.closest('.owner-label').classList.add('active');
                            }
                        }
                        
                        const submitBtn = issueForm.querySelector('button[type="submit"]');
                        if(submitBtn) submitBtn.textContent = '수정 완료'; // '추가'를 '수정 완료'로 변경
                        
                        issueTextInput.focus();
                    }
                });
            });

            // Bind checkbox events
            document.querySelectorAll('.custom-checkbox').forEach(chk => {
                chk.addEventListener('change', (e) => {
                    const idToToggle = parseInt(e.target.getAttribute('data-id'));
                    const issue = globalIssues.find(i => i.id === idToToggle);
                    if(issue) issue.done = e.target.checked;
                    saveIssuesToLocalStorage();
                    renderCalendar();
                });
            });
        }

        prevMonthBtn.addEventListener('click', () => {
            calDate.setMonth(calDate.getMonth() - 1);
            renderCalendar();
        });

        nextMonthBtn.addEventListener('click', () => {
            calDate.setMonth(calDate.getMonth() + 1);
            renderCalendar();
        });

        issueForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const startVal = issueStartDateInput.value;
            const endVal = issueEndDateInput.value;
            const textVal = issueTextInput.value.trim();
            const ownerRadio = document.querySelector('input[name="issueOwner"]:checked');
            const ownerVal = ownerRadio ? ownerRadio.value : '부부';

            if(startVal && endVal && textVal) {
                // Ensure end >= start
                if(endVal < startVal) {
                    alert('종료일은 시작일보다 빠를 수 없습니다.');
                    return;
                }

                if (editingIssueId !== null) {
                    const issueIndex = globalIssues.findIndex(i => i.id === editingIssueId);
                    if (issueIndex > -1) {
                        globalIssues[issueIndex].startDate = startVal;
                        globalIssues[issueIndex].endDate = endVal;
                        globalIssues[issueIndex].text = textVal;
                        globalIssues[issueIndex].owner = ownerVal;
                    }
                    editingIssueId = null;
                    const submitBtn = issueForm.querySelector('button[type="submit"]');
                    if(submitBtn) submitBtn.textContent = '추가';
                } else {
                    globalIssues.push({
                        id: issueIdCounter++,
                        startDate: startVal,
                        endDate: endVal,
                        text: textVal,
                        owner: ownerVal,
                        done: false
                    });
                }

                saveIssuesToLocalStorage();
                issueTextInput.value = '';
                renderCalendar();
            }
        });

        const todayStr = new Date().toISOString().split('T')[0];
        if(issueStartDateInput && issueEndDateInput) {
            issueStartDateInput.value = todayStr;
            issueEndDateInput.value = todayStr;
        }

        renderCalendar();
    }
    
    // Initialize Yearly Issue rendering
    if (typeof renderYearlyIssues === 'function') {
        renderYearlyIssues();
    }

    // --- Ledger Logic (Monthly Management) ---
    // Try to load monthly data, or migrate old format if it exists
    let rawData = JSON.parse(localStorage.getItem('morelife_ledger'));
    let ledgerData = {};

    // Migration / Initialization
    if (rawData && rawData.income) {
        // Old format detected, migrate to current month
        const currentMonth = new Date().toISOString().slice(0, 7);
        ledgerData[currentMonth] = rawData;
        localStorage.removeItem('morelife_ledger');
        localStorage.setItem('morelife_ledger_monthly', JSON.stringify(ledgerData));
    } else {
        ledgerData = JSON.parse(localStorage.getItem('morelife_ledger_monthly')) || {};
    }

    // --- 일회성 지우개 스크립트 (2026-03 제외 모두 삭제) ---
    if (!localStorage.getItem('morelife_cleaned_202603_only')) {
        let isCleaned = false;
        Object.keys(ledgerData).forEach(key => {
            if (key !== '2026-03') {
                delete ledgerData[key];
                isCleaned = true;
            }
        });
        if (isCleaned) {
            localStorage.setItem('morelife_ledger_monthly', JSON.stringify(ledgerData));
        }
        localStorage.setItem('morelife_cleaned_202603_only', 'true');
    }
    // ----------------------------------------------------

    let currentViewMonth = new Date();
    
    function getMonthKey(date) {
        return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
    }

    function getSelectedMonthData() {
        const key = getMonthKey(currentViewMonth);
        
        // 1. 해당 월 데이터가 아예 없으면 기본 구조로 초기화
        if (!ledgerData[key]) {
            ledgerData[key] = {
                income: [],
                savings: [],
                fixed: [],
                variableCategories: [{ name: '생활비', items: [] }]
            };
            localStorage.setItem('morelife_ledger_monthly', JSON.stringify(ledgerData));
        }

        // 2. 고정지출이 비어있거나, 들어있는 항목들이 전부 '새 항목'(금액 0원)인 경우는 빈 것으로 간주하고 이전 달 데이터로 덮어쓰기 복사 진행
        const isFixedEmpty = ledgerData[key].fixed.length === 0 || 
            ledgerData[key].fixed.every(item => item.name === '새 항목' && item.amount === 0);

        if (isFixedEmpty) {
            const sortedKeys = Object.keys(ledgerData).sort();
            let lastFixed = [];
            
            for (let i = sortedKeys.length - 1; i >= 0; i--) {
                const prevKey = sortedKeys[i];
                // 현재 달(key)보다 이전이면서 고정지출 데이터가 존재하는 달 찾기
                if (prevKey < key && ledgerData[prevKey].fixed && ledgerData[prevKey].fixed.length > 0) {
                    // 항목 이름만 복사하고, 금액은 모두 0으로 초기화
                    lastFixed = ledgerData[prevKey].fixed.map(item => ({
                        name: item.name,
                        amount: 0
                    }));
                    break;
                }
            }

            if (lastFixed.length > 0) {
                ledgerData[key].fixed = lastFixed;
                localStorage.setItem('morelife_ledger_monthly', JSON.stringify(ledgerData));
            }
        }

        return ledgerData[key];
    }

    const saveLedger = () => {
        localStorage.setItem('morelife_ledger_monthly', JSON.stringify(ledgerData));
        renderPersonalLedger();
    };

    function renderPersonalLedger() {
        const monthData = getSelectedMonthData();
        const displayMonth = document.getElementById('ledger-current-month');
        if (displayMonth) {
            displayMonth.textContent = `${currentViewMonth.getFullYear()}년 ${currentViewMonth.getMonth() + 1}월`;
        }

        // 1. Render Basic Tables (Income, Savings, Fixed)
        const renderBasicTable = (data, bodyId, totalId, type) => {
            const tbody = document.getElementById(bodyId);
            const totalEl = document.getElementById(totalId);
            if (!tbody || !totalEl) return 0;

            tbody.innerHTML = '';
            let total = 0;
            data.forEach((item, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td contenteditable="true" class="edit-name">${item.name}</td>
                    <td contenteditable="true" class="edit-amount amount-col">${item.amount.toLocaleString()}</td>
                    <td class="delete-col">
                        <button class="row-delete-btn">&times;</button>
                    </td>
                `;
                tbody.appendChild(tr);
                total += item.amount;

                tr.querySelector('.edit-name').onblur = (e) => {
                    item.name = e.target.textContent;
                    saveLedger();
                };
                tr.querySelector('.edit-amount').onblur = (e) => {
                    const val = parseInt(e.target.textContent.replace(/[^0-9]/g, '')) || 0;
                    item.amount = val;
                    saveLedger();
                };
                tr.querySelector('.row-delete-btn').onclick = () => {
                    data.splice(index, 1);
                    saveLedger();
                };
            });
            totalEl.textContent = total.toLocaleString();
            return total;
        };

        const totalIncome = renderBasicTable(monthData.income, 'income-body', 'income-total', 'income');
        const totalSavings = renderBasicTable(monthData.savings, 'savings-body', 'savings-total', 'savings');
        const totalFixed = renderBasicTable(monthData.fixed, 'fixed-body', 'fixed-total', 'fixed');

        // 2. Render Variable Expenses Grid
        const gridContainer = document.getElementById('variable-expense-grid');
        if (gridContainer) {
            gridContainer.innerHTML = '';
            let totalVariableSpent = 0;

            monthData.variableCategories.forEach((cat, catIdx) => {
                const col = document.createElement('section');
                col.className = 'table-card-modern variable-column'; // Use both for styling and identification
                let colTotal = cat.items ? cat.items.reduce((s, i) => s + i.amount, 0) : 0;
                totalVariableSpent += colTotal;

                col.innerHTML = `
                    <div class="column-header-wrap">
                        <h3 contenteditable="true" class="cat-name">${cat.name}</h3>
                        <button class="col-delete-btn">&times;</button>
                    </div>
                    <div class="table-scroll-area">
                        <table class="ledger-table">
                            <thead>
                                <tr>
                                    <th>항목</th>
                                    <th class="amount-col">금액</th>
                                    <th class="delete-col"></th>
                                </tr>
                            </thead>
                            <tbody class="variable-items-body"></tbody>
                        </table>
                    </div>
                    <div class="table-total-row">
                        <span>합계</span>
                        <span class="total-val">${colTotal.toLocaleString()}</span>
                    </div>
                    <button class="add-row-btn">+ 항목 추가</button>
                `;

                const tbody = col.querySelector('.variable-items-body');
                (cat.items || []).forEach((item, itemIdx) => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td contenteditable="true" class="edit-name">${item.name}</td>
                        <td contenteditable="true" class="edit-amount amount-col">${item.amount.toLocaleString()}</td>
                        <td class="delete-col">
                            <button class="row-delete-btn">&times;</button>
                        </td>
                    `;
                    tbody.appendChild(tr);

                    tr.querySelector('.edit-name').onblur = (e) => { item.name = e.target.textContent; saveLedger(); };
                    tr.querySelector('.edit-amount').onblur = (e) => {
                        const val = parseInt(e.target.textContent.replace(/[^0-9]/g, '')) || 0;
                        item.amount = val;
                        saveLedger();
                    };
                    tr.querySelector('.row-delete-btn').onclick = () => {
                        cat.items.splice(itemIdx, 1);
                        saveLedger();
                    };
                });

                col.querySelector('.cat-name').onblur = (e) => { cat.name = e.target.textContent; saveLedger(); };
                col.querySelector('.col-delete-btn').onclick = () => {
                    if(confirm(`'${cat.name}' 카테고리를 삭제하시겠습니까?`)) {
                        monthData.variableCategories.splice(catIdx, 1);
                        saveLedger();
                    }
                };
                col.querySelector('.add-row-btn').onclick = () => {
                    if(!cat.items) cat.items = [];
                    cat.items.push({ name: '새 항목', amount: 0 });
                    saveLedger();
                };
                gridContainer.appendChild(col);
            });

            // 3. Update Summary Sidebar
            const totalExpenditure = totalFixed + totalVariableSpent;
            setText('summary-income', totalIncome.toLocaleString());
            setText('summary-savings', totalSavings.toLocaleString());
            setText('summary-total-expenditure', totalExpenditure.toLocaleString());
            
            const remaining = totalIncome - totalSavings - totalFixed - totalVariableSpent;
            const remainingEl = document.getElementById('summary-remaining');
            const statusBadge = document.getElementById('success-badge');
            
            if (remainingEl) {
                remainingEl.textContent = remaining.toLocaleString();
                const isSuccess = remaining >= 0;
                
                const box = remainingEl.closest('.remaining-box');
                if (box) {
                    box.className = 'summary-item-modern remaining-box ' + (isSuccess ? 'success' : 'failure');
                }

                if (statusBadge) {
                    statusBadge.textContent = isSuccess ? '목표 달성' : '목표 실패';
                    statusBadge.style.backgroundColor = isSuccess ? '#10b981' : '#ef4444';
                }
            }
        }
    }

    function setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    // Month Navigation Bindings
    const prevBtn = document.getElementById('ledger-prev-month');
    const nextBtn = document.getElementById('ledger-next-month');
    if (prevBtn) {
        prevBtn.onclick = () => {
            currentViewMonth.setMonth(currentViewMonth.getMonth() - 1);
            renderPersonalLedger();
        };
    }
    if (nextBtn) {
        nextBtn.onclick = () => {
            currentViewMonth.setMonth(currentViewMonth.getMonth() + 1);
            renderPersonalLedger();
        };
    }

    // Global Add Row Bindings
    document.querySelectorAll('.add-row-btn').forEach(btn => {
        btn.onclick = () => {
            const type = btn.dataset.type;
            const monthData = getSelectedMonthData();
            if(monthData[type]) {
                monthData[type].push({ name: '새 항목', amount: 0 });
                saveLedger();
            }
        };
    });

    const addColBtn = document.querySelector('.add-column-btn');
    if (addColBtn) {
        addColBtn.onclick = () => {
            const name = prompt('새 지출 카테고리 이름:');
            if (name) {
                const monthData = getSelectedMonthData();
                monthData.variableCategories.push({ name, items: [] });
                saveLedger();
            }
        };
    }

    // Initialize rendering
    if (document.getElementById('personal-ledger')) {
        renderPersonalLedger();
    }

    // --- Wedding Budget Logic ---
    let weddingData = JSON.parse(localStorage.getItem('morelife_wedding')) || [];

    const saveWedding = () => {
        localStorage.setItem('morelife_wedding', JSON.stringify(weddingData));
        renderWeddingBudget();
    };

    function renderWeddingBudget() {
        const tbody = document.getElementById('wedding-body');
        const totalEl = document.getElementById('wedding-total');
        if (!tbody || !totalEl) return;

        tbody.innerHTML = '';
        let total = 0;
        weddingData.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td contenteditable="true" class="edit-name">${item.name}</td>
                <td contenteditable="true" class="edit-amount amount-col">${item.amount.toLocaleString()}</td>
                <td contenteditable="true" class="edit-memo">${item.memo || ''}</td>
                <td class="delete-col">
                    <button class="row-delete-btn">&times;</button>
                </td>
            `;
            tbody.appendChild(tr);
            total += item.amount;

            tr.querySelector('.edit-name').onblur = (e) => { item.name = e.target.textContent; saveWedding(); };
            tr.querySelector('.edit-amount').onblur = (e) => {
                const val = parseInt(e.target.textContent.replace(/[^0-9]/g, '')) || 0;
                item.amount = val;
                saveWedding();
            };
            tr.querySelector('.edit-memo').onblur = (e) => { item.memo = e.target.textContent; saveWedding(); };
            tr.querySelector('.row-delete-btn').onclick = () => { weddingData.splice(index, 1); saveWedding(); };
        });
        totalEl.textContent = total.toLocaleString();
    }

    const addWeddingBtn = document.getElementById('add-wedding-item');
    if (addWeddingBtn) {
        addWeddingBtn.onclick = () => {
            weddingData.push({ name: '새 항목', amount: 0, memo: '' });
            saveWedding();
        };
    }

    // --- Events Management Logic (경조사) ---
    // Separate storage keys for the three categories
    let eventsWedding = JSON.parse(localStorage.getItem('morelife_events_wedding')) || [];
    let eventsBirthday = JSON.parse(localStorage.getItem('morelife_events_birthday')) || [];
    let eventsFuneral = JSON.parse(localStorage.getItem('morelife_events_funeral')) || [];

    const saveEventsData = (type) => {
        if (type === 'wedding') {
            localStorage.setItem('morelife_events_wedding', JSON.stringify(eventsWedding));
            renderEventTable(eventsWedding, 'events-wedding-body', 'wedding-received-total', 'wedding-sent-total', 'wedding');
        } else if (type === 'birthday') {
            localStorage.setItem('morelife_events_birthday', JSON.stringify(eventsBirthday));
            renderEventTable(eventsBirthday, 'events-birthday-body', 'birthday-received-total', 'birthday-sent-total', 'birthday');
        } else if (type === 'funeral') {
            localStorage.setItem('morelife_events_funeral', JSON.stringify(eventsFuneral));
            renderEventTable(eventsFuneral, 'events-funeral-body', 'funeral-received-total', 'funeral-sent-total', 'funeral');
        }
    };

    function renderEventTable(data, bodyId, totalReceivedId, totalSentId, type) {
        const tbody = document.getElementById(bodyId);
        const totalReceivedEl = document.getElementById(totalReceivedId);
        const totalSentEl = document.getElementById(totalSentId);
        if (!tbody || !totalReceivedEl || !totalSentEl) return;

        tbody.innerHTML = '';
        let totalReceived = 0;
        let totalSent = 0;

        data.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td contenteditable="true" class="edit-name">${item.name}</td>
                <td contenteditable="true" class="edit-received amount-col">${item.received.toLocaleString()}</td>
                <td contenteditable="true" class="edit-sent amount-col">${item.sent.toLocaleString()}</td>
                <td style="text-align: center;">
                    <input type="checkbox" class="edit-attended" ${item.attended ? 'checked' : ''}>
                </td>
                <td class="delete-col">
                    <button class="row-delete-btn">&times;</button>
                </td>
            `;
            tbody.appendChild(tr);
            totalReceived += item.received;
            totalSent += item.sent;

            tr.querySelector('.edit-name').onblur = (e) => { item.name = e.target.textContent; saveEventsData(type); };
            tr.querySelector('.edit-received').onblur = (e) => {
                const val = parseInt(e.target.textContent.replace(/[^0-9]/g, '')) || 0;
                item.received = val;
                saveEventsData(type);
            };
            tr.querySelector('.edit-sent').onblur = (e) => {
                const val = parseInt(e.target.textContent.replace(/[^0-9]/g, '')) || 0;
                item.sent = val;
                saveEventsData(type);
            };
            tr.querySelector('.edit-attended').onchange = (e) => { item.attended = e.target.checked; saveEventsData(type); };
            tr.querySelector('.row-delete-btn').onclick = () => { data.splice(index, 1); saveEventsData(type); };
        });

        totalReceivedEl.textContent = totalReceived.toLocaleString();
        totalSentEl.textContent = totalSent.toLocaleString();
    }

    // Add row button for all event types
    document.querySelectorAll('.add-row-btn[data-event-type]').forEach(btn => {
        btn.onclick = () => {
            const type = btn.getAttribute('data-event-type');
            const newItem = { name: '이름', received: 0, sent: 0, attended: false };
            if (type === 'wedding') eventsWedding.push(newItem);
            else if (type === 'birthday') eventsBirthday.push(newItem);
            else if (type === 'funeral') eventsFuneral.push(newItem);
            saveEventsData(type);
        };
    });

    // Initial render for all categories
    renderWeddingBudget();
    renderEventTable(eventsWedding, 'events-wedding-body', 'wedding-received-total', 'wedding-sent-total', 'wedding');
    renderEventTable(eventsBirthday, 'events-birthday-body', 'birthday-received-total', 'birthday-sent-total', 'birthday');
    renderEventTable(eventsFuneral, 'events-funeral-body', 'funeral-received-total', 'funeral-sent-total', 'funeral');
});

