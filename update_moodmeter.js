const fs = require('fs');

let html = fs.readFileSync('moodmeter.html', 'utf8');

// 1. Add "saveBtn" next to reset and center buttons
if (!html.includes('id="saveBtn"')) {
  html = html.replace('<button class="reset" id="resetBtn">🔄 다시 시작</button>', 
                      '<button class="save" id="saveBtn" style="background:#8b5cf6; color:#fff; border:none; padding:12px; border-radius:12px; font-size:1.15rem; font-family:\'Okticon\', sans-serif; cursor:pointer; width:100%;">💾 내 감정 저장</button>\n          <button class="reset" id="resetBtn">🔄 다시 시작</button>');
}

// 2. Add saved-card HTML right before footer-note
if (!html.includes('saved-card')) {
  const savedCardHtml = `
    <section class="saved-card" style="margin-top:20px; background:#fff; border-radius:24px; padding:24px; box-shadow:0 8px 24px rgba(0,0,0,0.05); grid-column:1 / -1;">
      <div class="saved-head" style="margin-bottom:16px;">
        <h2 style="font-family:'Okticon',sans-serif; font-size:1.6rem; color:var(--text); margin:0;">📚 저장한 내 감정</h2>
        <div class="hint" style="font-size:1rem; color:var(--sub);">최대 6개까지 저장돼요.</div>
      </div>
      <div id="savedList" class="saved-list" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px,1fr)); gap:16px;">
        <div class="empty" id="emptyBox" style="grid-column:1/-1; padding:20px; text-align:center; border:2px dashed #eee; border-radius:16px; color:#999;">아직 저장한 감정이 없어요.<br><strong>내 감정 저장</strong> 버튼을 눌러 보세요.</div>
      </div>
    </section>
  `;
  html = html.replace('<div class="footer-note">', savedCardHtml + '\n    <div class="footer-note">');
}

// 3. Add JS for saveBtn and rendering saved list
if (!html.includes('const saveBtn = document.getElementById(\'saveBtn\');')) {
  html = html.replace('const resetBtn = document.getElementById(\'resetBtn\');', 'const resetBtn = document.getElementById(\'resetBtn\');\n      const saveBtn = document.getElementById(\'saveBtn\');\n      const savedList = document.getElementById(\'savedList\');\n      const emptyBox = document.getElementById(\'emptyBox\');\n      let savedMyEmotions = [];\n      try { savedMyEmotions = JSON.parse(localStorage.getItem(\'savedMyEmotions\')||"[]"); } catch(e){}\n');
}

if (!html.includes('function renderSavedList')) {
  const jsToAdd = `
      function quadrantEmoji(q) {
        return {red:'😡', yellow:'😄', blue:'😢', green:'😌'}[q];
      }
      
      function renderSavedList() {
        if(savedMyEmotions.length === 0){
          savedList.innerHTML = '';
          savedList.appendChild(emptyBox);
          return;
        }
        savedList.innerHTML = '';
        savedMyEmotions.forEach(item => {
          const el = document.createElement('div');
          el.style.cssText = 'background:#f8f6fb; padding:16px; border-radius:16px; display:flex; align-items:center; gap:16px;';
          el.innerHTML = \`
            <div style="font-size:2.5rem;">\${quadrantEmoji(item.q)}</div>
            <div>
              <div style="font-weight:bold; font-size:1.2rem;">\${item.word}</div>
              <div style="color:#666; font-size:0.9rem;">\${item.time} 저장</div>
            </div>
          \`;
          savedList.appendChild(el);
        });
      }

      saveBtn.addEventListener('click', () => {
        const p = Number(pleasant.value);
        const e = Number(energy.value);
        const q = quadrantOf(p, e);
        const word = mainWordOf(q, p, e);
        const item = { p, e, q, word, time: new Date().toLocaleTimeString('ko-KR', {hour:'2-digit', minute:'2-digit'}) };
        savedMyEmotions.unshift(item);
        if(savedMyEmotions.length > 6) savedMyEmotions = savedMyEmotions.slice(0, 6);
        localStorage.setItem('savedMyEmotions', JSON.stringify(savedMyEmotions));
        // 최근 저장한 감정을 최상위 연동 데이터로도 저장 (temperature.html 용도)
        localStorage.setItem('myMood', JSON.stringify({ p, e, q, word, emoji: quadrantEmoji(q) }));
        renderSavedList();
      });
      
      // 초기 렌더링 시 목록 그리기
      renderSavedList();
  `;
  html = html.replace('render();\n    })();', 'render();\n' + jsToAdd + '\n    })();');
}

// 4. Also update the previous render logic that saves to `myMood` without emoji
html = html.replace('localStorage.setItem(\'myMood\', JSON.stringify({ p, e, q, word }));', '/* removed auto-save, now only saves on btn click */');

fs.writeFileSync('moodmeter.html', html, 'utf8');
console.log('moodmeter.html updated');
