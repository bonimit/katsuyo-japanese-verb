(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const ACTIVE_FORMS = FORMS;
  const FORM_COUNT = ACTIVE_FORMS.length;
  const key = 'kotobaQuest.v2';
  const defaults = { reading:'kanji', sound:true, streak:0, lastPlayed:null, history:[], misses:{}, customVerbIds:[] };
  let saved;
  try { saved = { ...defaults, ...JSON.parse(localStorage.getItem(key) || '{}') }; } catch { saved = {...defaults}; }
  let state = {};
  const persist = () => localStorage.setItem(key, JSON.stringify(saved));
  const normalize = v => v.trim().replace(/[\s　・,.。!！?？]/g,'').normalize('NFKC');
  const screens = {welcome:$('#welcome-screen'),game:$('#game-screen'),results:$('#results-screen')};
  const JLPT_LEVELS=['N5','N4','N3','N2','N1'];

  function show(name){Object.entries(screens).forEach(([k,e])=>e.classList.toggle('hidden',k!==name));window.scrollTo({top:0,behavior:'smooth'});}
  function animateMascot(mood){
    const className=`is-${mood}`,duration=mood==='cheering'?900:650;
    document.querySelectorAll('.mascot').forEach(mascot=>{
      mascot.classList.remove('is-cheering','is-thinking');
      void mascot.offsetWidth;
      mascot.classList.add(className);
      setTimeout(()=>mascot.classList.remove(className),duration);
    });
  }
  function chooseAdaptive(avoid){
    const recent=saved.history.filter(h=>h.jlpt&&h.formCount).slice(0,6);
    let targetIndex;
    if(!recent.length){
      targetIndex=Math.floor(Math.random()*JLPT_LEVELS.length);
      state.adaptiveReason=`First adaptive round: trying ${JLPT_LEVELS[targetIndex]} to estimate your level.`;
    }else{
      const correct=recent.reduce((sum,h)=>sum+h.firstTry,0),forms=recent.reduce((sum,h)=>sum+h.formCount,0),attempts=recent.reduce((sum,h)=>sum+h.attempts,0);
      const accuracy=correct/forms,effort=attempts/forms,lastIndex=JLPT_LEVELS.indexOf(recent[0].jlpt);
      targetIndex=Math.max(0,lastIndex);
      if(accuracy>=.82&&effort<=1.45)targetIndex++;
      else if(accuracy<.58||effort>2.1)targetIndex--;
      targetIndex=Math.max(0,Math.min(JLPT_LEVELS.length-1,targetIndex));
      const explore=Math.random()<.25?(Math.random()<.5?-1:1):0;
      targetIndex=Math.max(0,Math.min(JLPT_LEVELS.length-1,targetIndex+explore));
      state.adaptiveReason=`AI selected ${JLPT_LEVELS[targetIndex]} from your recent ${Math.round(accuracy*100)}% first-try accuracy.`;
    }
    const pool=VERBS.filter(v=>v.jlpt===JLPT_LEVELS[targetIndex]&&v.id!==avoid);
    return pool[Math.floor(Math.random()*pool.length)]||VERBS[Math.floor(Math.random()*VERBS.length)];
  }
  function choose(level,avoid,source='difficulty'){
    let p;
    if(source==='custom') p=VERBS.filter(v=>saved.customVerbIds.includes(v.id));
    else if(/^N[1-5]$/.test(source)) p=VERBS.filter(v=>v.jlpt===source);
    else if(source!=='difficulty') p=VERBS.filter(v=>v.group.startsWith(source));
    else if(level==='adaptive')return chooseAdaptive(avoid);
    else p=level==='mixed'?VERBS:VERBS.filter(v=>v.difficulty===level);
    if(!p.length)p=VERBS;
    const d=p.filter(v=>v.id!==avoid);
    const pool=d.length?d:p;
    return pool[Math.floor(Math.random()*pool.length)];
  }
  function acceptedAnswers(i){
    const a=state.verb.forms[ACTIVE_FORMS[i].id];
    const candidates=[a.answer,...a.alternatives];
    const verb=state.verb,readingBase=verb.reading.slice(0,-1),writtenBase=/[一-龯々]/.test(verb.kanji)?verb.kanji.slice(0,-1):'';
    if(writtenBase){
      candidates.forEach(candidate=>{
        if(candidate.startsWith(readingBase))candidates.push(writtenBase+candidate.slice(readingBase.length));
      });
    }
    return [...new Set(candidates.map(normalize))];
  }
  function accepted(i,value){return acceptedAnswers(i).includes(normalize(value));}
  function displayVerb(){
    const hasKanji=/[一-龯々]/.test(state.verb.kanji);
    if(!hasKanji)return state.verb.reading;
    return saved.reading==='kanji' && state.verb.furigana ? state.verb.furigana : state.verb.kanji;
  }

  function startRound(verb){
    state={verb,difficulty:state.difficulty||'beginner',verbSource:state.verbSource||'difficulty',adaptiveReason:state.adaptiveReason||'',current:0,attempts:Array(FORM_COUNT).fill(0),solved:Array(FORM_COUNT).fill(false),firstTry:Array(FORM_COUNT).fill(false)};
    $('#verb-display').innerHTML=displayVerb(); $('#verb-reading').textContent=verb.reading;
    $('#verb-romaji').textContent=verb.romaji;
    $('#verb-meaning').textContent=verb.meaning; $('#verb-group').textContent=`${verb.jlpt} · ${verb.group} verb`;
    $('#companion-message').textContent=state.difficulty==='adaptive'&&state.verbSource==='difficulty'?state.adaptiveReason:`One verb, ${FORM_COUNT} core forms. We’ll work through them in order.`;
    renderMap(); renderCurrentForm(); updateProgress(); updateConjugationGuide(); show('game');
  }

  function renderCurrentForm(){
    const i=state.current,f=ACTIVE_FORMS[i];
    $('#challenge-title').textContent=f.name;
    $('#form-description').textContent=f.prompt;
    $('#forms-grid').innerHTML=`<form class="form-question" data-index="${i}" autocomplete="off">
      <div class="form-question-head"><label for="answer-${i}">Form ${i+1} of ${FORM_COUNT}</label><span>${f.short}</span></div>
      <div class="answer-row"><input id="answer-${i}" lang="ja" placeholder="Type in Japanese…" required autofocus><button class="submit-answer" type="submit">Check</button><button class="primary-button next-button hidden" id="finish-button" type="button">Next form <span>→</span></button></div>
      <p class="form-question-feedback" aria-live="polite">Japanese keyboard recommended</p>
    </form>`;
    $('#forms-grid form').addEventListener('submit',checkForm);
    $('#finish-button').classList.add('hidden');
    setTimeout(()=>$('#forms-grid input').focus(),100);
  }

  function renderMap(){
    $('#form-map-list').innerHTML=ACTIVE_FORMS.map((f,i)=>`<li data-index="${i}"><i>${i+1}</i><span>${f.name}</span><b>${f.short}</b></li>`).join('');
  }

  function updateProgress(){
    const n=state.solved.filter(Boolean).length;
    $('#progress-text').textContent=`${n} of ${FORM_COUNT}`; $('#map-count').textContent=`${n} / ${FORM_COUNT}`; $('#progress-bar').style.width=`${n/FORM_COUNT*100}%`;
    [...$('#form-map-list').children].forEach((li,i)=>{li.className=state.solved[i]?'done':i===state.current?'current':'';li.querySelector('i').textContent=state.solved[i]?'✓':i+1;});
  }

  function hint(i,value){
    const f=ACTIVE_FORMS[i], a=state.verb.forms[f.id], tries=state.attempts[i];
    const parts=a.breakdown||[],stem=parts[0]||state.verb.kanji,ending=parts.slice(1).join('')||a.answer.slice(-2);
    const chars=[...a.answer];
    if(tries>=4)return `Answer: ${a.answer}。Type it once to help your memory.`;
    if(tries===3)return `Almost filled in: ${chars.slice(0,-1).join('')}＿  Only the last character is missing.`;
    if(tries===2)return `Build it like this: ${stem} + ${ending}。The complete answer has ${chars.length} characters.`;
    if(f.id.includes('mas'))return `${state.verb.kanji} is ${state.verb.group}. Use this exact rule: ${a.rule}。Look for the polite ending.`;
    if(['nai','negativeTe','prohibitive'].includes(f.id))return `${state.verb.kanji} is ${state.verb.group}. For this negative form: ${a.rule}。`;
    if(['te','ta','tara'].includes(f.id))return `Listen for the sound change. The rule is: ${a.rule}。`;
    return `${state.verb.kanji} is ${state.verb.group}. Apply this rule: ${a.rule}。`;
  }

  function exampleSentence(formId,answer){
    const examples={
      masu:`明日は${answer}。`,
      masen:`今日は${answer}。`,
      mashita:`昨日、${answer}。`,
      masendeshita:`昨日は${answer}。`,
      nai:`今日は${answer}。`,
      ta:`さっき${answer}。`,
      te:`まずは${answer}ください。`,
      potential:`これなら${answer}と思います。`,
      passive:`そのとき、急に${answer}。`,
      causative:`本人に${answer}ことにしました。`,
      causativePassive:`仕事で${answer}ことになりました。`,
      volitional:`よし、今から${answer}。`,
      politeVolitional:`一緒に${answer}。`,
      imperative:`急いで！${answer}！`,
      ba:`時間があれば、${answer}。`,
      tara:`もし${answer}、教えてください。`,
      tai:`今度は${answer}です。`,
      negativeTe:`今日は${answer}、家にいました。`,
      prohibitive:`危ないから、${answer}！`
    };
    return examples[formId]||`今日は${answer}。`;
  }
  function exampleDetails(formId,answer,verb){
    const kanaAnswer=verb.forms[formId].alternatives.find(x=>/^[ぁ-ゖー]+$/.test(x))||answer;
    const gloss=verb.meaning.replace(/^to\s+/i,'');
    const thaiMap={たべる:'กิน',よむ:'อ่าน',かく:'เขียน',いく:'ไป',する:'ทำ',くる:'มา',みる:'ดู',おきる:'ตื่น',かう:'ซื้อ',はなす:'พูด',あける:'เปิด',しめる:'ปิด',およぐ:'ว่ายน้ำ',まつ:'รอ',つづける:'ทำต่อ',きめる:'ตัดสินใจ',えらぶ:'เลือก',もどる:'กลับ',みとめる:'ยอมรับ',くわえる:'เพิ่ม',おこなう:'ดำเนินการ',うしなう:'สูญเสีย'};
    const thVerb=thaiMap[verb.reading]||`ทำสิ่งนี้ (${gloss})`;
    const english={
      masu:`I’ll ${gloss} tomorrow.`,masen:`I won’t ${gloss} today.`,mashita:`I ${gloss} yesterday.`,masendeshita:`I didn’t ${gloss} yesterday.`,
      nai:`I’m not going to ${gloss} today.`,ta:`I just ${gloss}.`,te:`Please ${gloss} first.`,potential:`I think I can ${gloss} this.`,
      passive:`It was ${gloss} unexpectedly.`,causative:`I decided to let them ${gloss}.`,causativePassive:`I was made to ${gloss} at work.`,
      volitional:`Okay, let’s ${gloss} now.`,politeVolitional:`Let’s ${gloss} together.`,imperative:`Hurry! ${gloss}!`,ba:`If there’s time, I’ll ${gloss}.`,
      tara:`If you ${gloss}, please tell me.`,tai:`I want to ${gloss} next time.`,negativeTe:`I stayed home without ${gloss} today.`,prohibitive:`It’s dangerous, so don’t ${gloss}!`
    };
    const thai={
      masu:`พรุ่งนี้จะ${thVerb}`,masen:`วันนี้จะไม่${thVerb}`,mashita:`เมื่อวาน${thVerb}แล้ว`,masendeshita:`เมื่อวานไม่ได้${thVerb}`,
      nai:`วันนี้ไม่${thVerb}`,ta:`เมื่อกี้${thVerb}แล้ว`,te:`กรุณา${thVerb}ก่อน`,potential:`คิดว่าน่าจะ${thVerb}ได้`,
      passive:`จู่ ๆ ก็ถูก${thVerb}`,causative:`ตัดสินใจให้เขา${thVerb}`,causativePassive:`ถูกบังคับให้${thVerb}ที่ทำงาน`,
      volitional:`เอาล่ะ มา${thVerb}กัน`,politeVolitional:`มา${thVerb}ด้วยกันเถอะ`,imperative:`เร็วเข้า! ${thVerb}!`,ba:`ถ้ามีเวลาก็จะ${thVerb}`,
      tara:`ถ้า${thVerb}แล้ว ช่วยบอกด้วย`,tai:`ครั้งหน้าอยาก${thVerb}`,negativeTe:`วันนี้อยู่บ้านโดยไม่${thVerb}`,prohibitive:`อันตราย อย่า${thVerb}!`
    };
    return {japanese:exampleSentence(formId,answer),hiragana:exampleSentence(formId,kanaAnswer),english:english[formId]||`I will ${gloss}.`,thai:thai[formId]||`จะ${thVerb}`};
  }

  function checkForm(e){
    e.preventDefault(); const form=e.currentTarget,i=Number(form.dataset.index),input=form.querySelector('input'),feedback=form.querySelector('.form-question-feedback');
    if(state.solved[i])return; state.attempts[i]++;
    if(!accepted(i,input.value)){
      const message=hint(i,input.value); input.classList.add('wrong'); setTimeout(()=>input.classList.remove('wrong'),400);
      feedback.className='form-question-feedback error'; feedback.textContent=message; $('#companion-message').textContent=message;
      animateMascot('thinking');
      saved.misses[ACTIVE_FORMS[i].id]=(saved.misses[ACTIVE_FORMS[i].id]||0)+1;persist();return;
    }
    const a=state.verb.forms[ACTIVE_FORMS[i].id]; state.solved[i]=true; state.firstTry[i]=state.attempts[i]===1;
    input.value=a.answer;input.disabled=true;input.className='correct';form.querySelector('button').disabled=true;form.classList.add('solved');
    feedback.className='form-question-feedback';feedback.textContent='✓ Correct!';
    const example=exampleDetails(ACTIVE_FORMS[i].id,a.answer,state.verb);
    form.insertAdjacentHTML('beforeend',`<div class="example-sentence"><span>REAL-LIFE EXAMPLE</span><p lang="ja">${example.japanese}</p><dl><div><dt>ひらがな</dt><dd lang="ja">${example.hiragana}</dd></div><div><dt>English</dt><dd>${example.english}</dd></div><div><dt>ไทย</dt><dd lang="th">${example.thai}</dd></div></dl></div><details><summary>How this form works</summary><p class="mini-explanation">${a.explanation}<br><strong>${a.rule}</strong></p></details>`);
    $('#companion-message').textContent=['Great recall! Keep going.','Exactly right—nice transformation.','正解！ Another form complete.'][i%3];
    animateMascot('cheering');
    $('#finish-button').innerHTML=i===FORM_COUNT-1?'See round results <span>→</span>':'Next form <span>→</span>';
    $('#finish-button').classList.remove('hidden');
    $('#finish-button').focus();
    updateProgress();
  }

  function nextForm(){
    if(state.current===FORM_COUNT-1){finish();return;}
    state.current++;
    renderCurrentForm();
    updateProgress();
    $('#companion-message').textContent=`Next: ${ACTIVE_FORMS[state.current].name}. Keep the ${state.verb.group} pattern in mind.`;
  }

  function finish(){
    const today=new Date().toISOString().slice(0,10), total=state.attempts.reduce((a,b)=>a+b,0), score=state.firstTry.filter(Boolean).length;
    if(saved.lastPlayed!==today){const y=new Date(Date.now()-86400000).toISOString().slice(0,10);saved.streak=saved.lastPlayed===y?saved.streak+1:1;saved.lastPlayed=today;}
    saved.history.unshift({date:today,verb:state.verb.kanji,jlpt:state.verb.jlpt,attempts:total,firstTry:score,formCount:FORM_COUNT});saved.history=saved.history.slice(0,20);persist();
    const max=Math.max(...state.attempts), tough=max>1?ACTIVE_FORMS[state.attempts.indexOf(max)]:null;
    $('#accuracy-score').textContent=`${score}/${FORM_COUNT}`;$('#attempt-score').textContent=total;$('#toughest-score').textContent=tough?tough.name:'None';$('#toughest-note').textContent=tough?`${max} attempts`:'Smooth round';
    $('#summary-verb').textContent=`${state.verb.kanji} · ${state.verb.meaning}`;$('#results-subtitle').textContent=`You completed all ${FORM_COUNT} forms of ${state.verb.kanji}.`;
    $('#summary-list').innerHTML=ACTIVE_FORMS.map((f,i)=>{const a=state.verb.forms[f.id],ex=exampleDetails(f.id,a.answer,state.verb);return `<details class="summary-row"><summary><span>${f.name}</span><strong>${a.answer}</strong><b>${state.firstTry[i]?'✓':`${state.attempts[i]} tries`}</b></summary><div class="summary-explanation"><div class="summary-example"><strong lang="ja">${ex.japanese}</strong><br><span lang="ja">${ex.hiragana}</span><br>${ex.english}<br><span lang="th">${ex.thai}</span></div>${a.explanation}<br><strong>${a.rule}</strong></div></details>`}).join('');
    $('#results-message').textContent=tough?`Good work. Let’s revisit ${tough.name.toLowerCase()} next round.`:'A clean round—you recalled every form first time!';
    $('#weak-title').textContent=tough?tough.name:'Try a new verb group';$('#weak-description').textContent=tough?state.verb.forms[tough.id].rule:'Keep your transformation rules flexible.';
    updateHeader();show('results');animateMascot('cheering');
  }

  function updateHeader(){$('#streak-count').textContent=saved.streak;$('#sound-toggle').setAttribute('aria-pressed',String(saved.sound));$('#sound-toggle span').textContent=saved.sound?'♪':'×';}
  function buildVerbSelector(){
    $('#custom-verb-list').innerHTML=VERBS.map(v=>{const type=verbType(v);return `<label data-jlpt="${v.jlpt}" data-group="${v.group.split(' ')[0]}" data-type="${type}" data-search="${`${v.kanji} ${v.reading} ${v.romaji} ${v.meaning}`.toLowerCase()}"><input type="checkbox" name="customVerb" value="${v.id}" ${saved.customVerbIds.includes(v.id)?'checked':''}><span><strong>${v.kanji}</strong> <span class="verb-kana">${v.reading}</span><br><span class="verb-romaji">${v.romaji}</span> · ${v.meaning}<br><small>${v.jlpt} · ${v.group} · ${type}</small></span></label>`}).join('');
    $('#verb-count').textContent=`${VERBS.length.toLocaleString()} verbs available`;
  }
  function verbType(v){
    const stateTerms=/\b(be|exist|have|need|know|understand|remain|seem|belong|contain|resemble|require|mean|differ|lack|possess)\b/i;
    return stateTerms.test(v.meaning)?'state':'action';
  }
  function filterCustomVerbs(){
    const query=$('#verb-search').value.trim().toLowerCase();
    const jlpt=[...document.querySelectorAll('[name="filterJlpt"]:checked')].map(x=>x.value);
    const group=[...document.querySelectorAll('[name="filterGroup"]:checked')].map(x=>x.value);
    const type=[...document.querySelectorAll('[name="filterType"]:checked')].map(x=>x.value);
    let visible=0;
    $('#custom-verb-list').querySelectorAll('label').forEach(label=>{
      const show=(!query||label.dataset.search.includes(query))&&(!jlpt.length||jlpt.includes(label.dataset.jlpt))&&(!group.length||group.includes(label.dataset.group))&&(!type.length||type.includes(label.dataset.type));
      label.classList.toggle('hidden',!show);if(show)visible++;
    });
    $('#verb-count').textContent=`${visible.toLocaleString()} matching · ${$('#custom-verb-list input:checked').length.toLocaleString()} selected`;
  }
  function updateConjugationGuide(){
    const group=state.verb.group.startsWith('Godan')?'Godan':state.verb.group.startsWith('Ichidan')?'Ichidan':'Irregular';
    $('#guide-current-group').textContent=`${group} pattern · ${state.verb.kanji}`;
    document.querySelectorAll('.group-guide').forEach(section=>{
      const current=section.dataset.guideGroup===group;
      section.classList.toggle('current',current);
      section.open=current;
    });
  }
  $('#setup-form').addEventListener('submit',e=>{
    e.preventDefault();const d=new FormData(e.currentTarget),source=d.get('verbSource');
    if(source==='custom'){
      saved.customVerbIds=d.getAll('customVerb');
      if(!saved.customVerbIds.length){$('#custom-verb-error').textContent='Select at least one verb for your custom group.';return;}
    }
    $('#custom-verb-error').textContent='';state.difficulty=d.get('difficulty');state.verbSource=source;saved.reading=d.get('reading');persist();startRound(choose(state.difficulty,null,source));
  });
  $('#forms-grid').addEventListener('click',e=>{if(e.target.closest('#finish-button'))nextForm();});$('#quit-button').addEventListener('click',()=>show('welcome'));
  $('#reading-toggle').addEventListener('click',()=>{saved.reading=saved.reading==='kanji'?'hiragana':'kanji';persist();$('#verb-display').innerHTML=displayVerb();$('#reading-toggle').textContent=saved.reading==='kanji'?'漢 Kanji only':'ふ Furigana';});
  $('#retry-button').addEventListener('click',()=>startRound(state.verb));$('#new-verb-button').addEventListener('click',()=>startRound(choose(state.difficulty,state.verb.id,state.verbSource)));
  $('#expand-all').addEventListener('click',e=>{const rows=[...document.querySelectorAll('.summary-row')],open=rows.some(r=>!r.open);rows.forEach(r=>r.open=open);e.currentTarget.textContent=open?'Collapse all':'Expand all';});
  $('#sound-toggle').addEventListener('click',()=>{saved.sound=!saved.sound;persist();updateHeader();});
  $('#history-button').addEventListener('click',()=>{$('#history-content').innerHTML=saved.history.length?saved.history.map(x=>`<div class="history-item"><span><strong>${x.verb}</strong> ${x.jlpt?`<small>${x.jlpt}</small>`:''}<br>${x.date}</span><span>${x.firstTry}/${x.formCount||7} first try<br>${x.attempts} attempts</span></div>`).join(''):'<p class="history-empty">Complete your first quest to start a practice history.</p>';$('#history-dialog').showModal();});
  $('.dialog-close').addEventListener('click',()=>$('#history-dialog').close());
  $('#verb-source').addEventListener('change',e=>$('#custom-verbs').classList.toggle('hidden',e.target.value!=='custom'));
  $('#verb-search').addEventListener('input',filterCustomVerbs);
  $('.catalog-filters').addEventListener('change',filterCustomVerbs);
  $('#custom-verb-list').addEventListener('change',filterCustomVerbs);
  $('#select-visible').addEventListener('click',()=>{$('#custom-verb-list').querySelectorAll('label:not(.hidden) input').forEach(input=>input.checked=true);filterCustomVerbs();});
  $('#clear-custom').addEventListener('click',()=>{$('#custom-verb-list').querySelectorAll('input').forEach(input=>input.checked=false);filterCustomVerbs();});
  $('#guide-toggle').addEventListener('click',e=>{const content=$('#guide-content'),hidden=content.classList.toggle('hidden');e.currentTarget.textContent=hidden?'Show':'Hide';e.currentTarget.setAttribute('aria-expanded',String(!hidden));});
  document.addEventListener('keydown',e=>{
    if(e.key!=='Enter'||screens.game.classList.contains('hidden')||$('#finish-button').classList.contains('hidden'))return;
    if(e.target.closest('#history-dialog'))return;
    e.preventDefault();
    nextForm();
  });
  buildVerbSelector();
  document.querySelector(`input[name="reading"][value="${saved.reading}"]`).checked=true;
  $('#reading-toggle').textContent=saved.reading==='kanji'?'漢 Kanji only':'ふ Furigana';
  updateHeader();
})();
