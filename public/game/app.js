(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  let ACTIVE_FORMS = [...FORMS];
  let FORM_COUNT = ACTIVE_FORMS.length;
  const key = 'kotobaQuest.v2';
  const defaults = { reading:'kanji', sound:true, soundVolume:35, theme:null, streak:0, lastPlayed:null, history:[], misses:{}, formStats:{}, practiceMode:'all', adaptiveLevel:null, adaptiveFeedback:{easy:0,hard:0}, customVerbIds:[] };
  let saved;
  try { saved = { ...defaults, ...JSON.parse(localStorage.getItem(key) || '{}') }; } catch { saved = {...defaults}; }
  const systemTheme=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
  const applyTheme=theme=>{document.documentElement.dataset.theme=theme;const toggle=$('#theme-toggle');if(toggle){const light=theme==='light';toggle.setAttribute('aria-label',light?'Switch to dark mode':'Switch to light mode');toggle.setAttribute('aria-pressed',String(light));toggle.querySelector('span').textContent=light?'☾':'☀';}};
  applyTheme(saved.theme||systemTheme);
  let state = {};
  const persist = () => localStorage.setItem(key, JSON.stringify(saved));
  const normalize = v => v.trim().replace(/[\s　・,.。!！?？]/g,'').normalize('NFKC');
  const screens = {welcome:$('#welcome-screen'),game:$('#game-screen'),results:$('#results-screen')};
  const JLPT_LEVELS=['N5','N4','N3','N2','N1'];
  let audioContext;

  function playSound(kind){
    if(!saved.sound)return;
    const AudioEngine=window.AudioContext||window.webkitAudioContext;if(!AudioEngine)return;
    audioContext ||= new AudioEngine();if(audioContext.state==='suspended')audioContext.resume();
    const patterns={
      start:[[392,0,.07,.018,'sine'],[523.25,.07,.1,.022,'sine']],
      correct:[[523.25,0,.08,.025,'sine'],[659.25,.065,.11,.026,'sine']],
      wrong:[[220,0,.1,.018,'triangle'],[185,.085,.13,.014,'triangle']],
      next:[[440,0,.065,.016,'sine']],
      complete:[[523.25,0,.1,.022,'sine'],[659.25,.09,.1,.023,'sine'],[783.99,.18,.12,.024,'sine'],[1046.5,.29,.2,.022,'sine']],
      toggle:[[587.33,0,.08,.015,'sine']]
    };
    const now=audioContext.currentTime;
    (patterns[kind]||patterns.next).forEach(([frequency,delay,duration,volume,type])=>{
      const oscillator=audioContext.createOscillator(),gain=audioContext.createGain();
      oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,now+delay);
      const level=volume*(saved.soundVolume/100);gain.gain.setValueAtTime(.0001,now+delay);gain.gain.exponentialRampToValueAtTime(Math.max(.0001,level),now+delay+.012);gain.gain.exponentialRampToValueAtTime(.0001,now+delay+duration);
      oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start(now+delay);oscillator.stop(now+delay+duration+.02);
    });
  }

  function show(name){Object.entries(screens).forEach(([k,e])=>e.classList.toggle('hidden',k!==name));window.scrollTo({top:0,behavior:'smooth'});}
  function animateMascot(mood,temporary=false){
    const className=`is-${mood}`,duration=mood==='cheering'?1200:750;
    document.querySelectorAll('.mascot').forEach(mascot=>{
      mascot.classList.remove('is-cheering','is-thinking');
      if(mascot.dataset[mood]){
        const source=new URL(mascot.dataset[mood],document.baseURI);
        if(mood!=='idle')source.searchParams.set('play',String(Date.now()));
        mascot.src=source.href;
      }
      void mascot.offsetWidth;
      mascot.classList.add(className);
      setTimeout(()=>{mascot.classList.remove(className);if(temporary)mascot.src=mascot.dataset.idle;},duration);
    });
  }
  function celebrateFrom(element){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const rect=element.getBoundingClientRect(),colors=['#f4b4cf','#f08f58','#f7cf63','#a74063','#2f705d'];
    for(let i=0;i<14;i++){
      const particle=document.createElement('i');
      particle.className='success-spark';
      particle.style.setProperty('--spark-x',`${(Math.random()-.5)*150}px`);
      particle.style.setProperty('--spark-y',`${-45-Math.random()*95}px`);
      particle.style.setProperty('--spark-r',`${Math.random()*220-110}deg`);
      particle.style.left=`${rect.left+rect.width/2}px`;particle.style.top=`${rect.top+rect.height/2}px`;
      particle.style.background=colors[i%colors.length];
      document.body.appendChild(particle);setTimeout(()=>particle.remove(),900);
    }
  }
  function chooseAdaptive(avoid){
    const recent=saved.history.filter(h=>h.jlpt&&h.formCount).slice(0,6);
    let targetIndex;
    if(Number.isInteger(saved.adaptiveLevel)){
      targetIndex=saved.adaptiveLevel;
      state.adaptiveReason=`AI remembered your level feedback and selected ${JLPT_LEVELS[targetIndex]}.`;
    }else if(!recent.length){
      targetIndex=0;
      state.adaptiveReason=`First adaptive round: starting at ${JLPT_LEVELS[targetIndex]} to estimate your level.`;
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
    saved.adaptiveLevel=targetIndex;persist();
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
  function chooseAdaptiveForms(){
    const previous=new Set((saved.history[0]?.formIds)||[]);
    const ranked=FORMS.map(form=>{
      const stats=saved.formStats[form.id]||{rounds:0,firstTry:0,attempts:0};
      const unseen=stats.rounds===0;
      const accuracy=unseen?0:stats.firstTry/stats.rounds;
      const effort=unseen?0:Math.max(0,stats.attempts/stats.rounds-1);
      const misses=saved.misses[form.id]||0;
      const weakness=(1-accuracy)*4+Math.min(effort,3)*1.4+Math.min(misses,8)*.3;
      const discovery=unseen?5:0;
      const repeatPenalty=previous.has(form.id)?1.1:0;
      return {form,score:weakness+discovery-repeatPenalty+Math.random()*3.2,unseen};
    }).sort((a,b)=>b.score-a.score);
    const picked=ranked.slice(0,7);
    const weakCount=picked.filter(x=>!x.unseen).length;
    state.formReason=saved.history.length
      ?`AI mixed ${weakCount} priority forms with fresh random practice based on your previous accuracy.`
      :'AI created a varied seven-form baseline to learn your strengths.';
    return picked.map(x=>x.form);
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
  function kanaAnswer(i){const a=state.verb.forms[ACTIVE_FORMS[i].id];return a.alternatives.find(x=>/^[ぁ-ゖー]+$/.test(x))||a.answer;}
  function kanaToRomaji(value){
    const pairs={きゃ:'kya',きゅ:'kyu',きょ:'kyo',しゃ:'sha',しゅ:'shu',しょ:'sho',ちゃ:'cha',ちゅ:'chu',ちょ:'cho',にゃ:'nya',にゅ:'nyu',にょ:'nyo',ひゃ:'hya',ひゅ:'hyu',ひょ:'hyo',みゃ:'mya',みゅ:'myu',みょ:'myo',りゃ:'rya',りゅ:'ryu',りょ:'ryo',ぎゃ:'gya',ぎゅ:'gyu',ぎょ:'gyo',じゃ:'ja',じゅ:'ju',じょ:'jo',びゃ:'bya',びゅ:'byu',びょ:'byo',ぴゃ:'pya',ぴゅ:'pyu',ぴょ:'pyo'};
    const singles={あ:'a',い:'i',う:'u',え:'e',お:'o',か:'ka',き:'ki',く:'ku',け:'ke',こ:'ko',さ:'sa',し:'shi',す:'su',せ:'se',そ:'so',た:'ta',ち:'chi',つ:'tsu',て:'te',と:'to',な:'na',に:'ni',ぬ:'nu',ね:'ne',の:'no',は:'ha',ひ:'hi',ふ:'fu',へ:'he',ほ:'ho',ま:'ma',み:'mi',む:'mu',め:'me',も:'mo',や:'ya',ゆ:'yu',よ:'yo',ら:'ra',り:'ri',る:'ru',れ:'re',ろ:'ro',わ:'wa',を:'wo',ん:'n',が:'ga',ぎ:'gi',ぐ:'gu',げ:'ge',ご:'go',ざ:'za',じ:'ji',ず:'zu',ぜ:'ze',ぞ:'zo',だ:'da',ぢ:'ji',づ:'zu',で:'de',ど:'do',ば:'ba',び:'bi',ぶ:'bu',べ:'be',ぼ:'bo',ぱ:'pa',ぴ:'pi',ぷ:'pu',ぺ:'pe',ぽ:'po'};
    let result='',double=false;for(let i=0;i<value.length;i++){const char=value[i];if(char==='っ'){double=true;continue;}const pair=pairs[value.slice(i,i+2)];let syllable=pair||singles[char]||char;if(pair)i++;if(double){const consonant=syllable.match(/^[bcdfghjklmnpqrstvwxyz]/)?.[0];if(consonant)syllable=consonant+syllable;double=false;}if(char==='ー'){const vowel=result.match(/[aeiou]$/)?.[0]||'';syllable=vowel;}result+=syllable;}return result;
  }
  function typingGuide(i){const kana=kanaAnswer(i);return {kana,romaji:kanaToRomaji(kana)};}
  function displayVerb(){
    const hasKanji=/[一-龯々]/.test(state.verb.kanji);
    if(!hasKanji)return state.verb.reading;
    return saved.reading==='kanji' && state.verb.furigana ? state.verb.furigana : state.verb.kanji;
  }

  function startRound(verb,preserveForms=false){
    const config={difficulty:state.difficulty||'beginner',verbSource:state.verbSource||'difficulty',adaptiveReason:state.adaptiveReason||'',practiceMode:state.practiceMode||saved.practiceMode||'all',formReason:state.formReason||''};
    if(!preserveForms){ACTIVE_FORMS=config.practiceMode==='adaptive'?chooseAdaptiveForms():[...FORMS];FORM_COUNT=ACTIVE_FORMS.length;}
    state={verb,...config,formReason:state.formReason||config.formReason,current:0,attempts:Array(FORM_COUNT).fill(0),solved:Array(FORM_COUNT).fill(false),firstTry:Array(FORM_COUNT).fill(false)};
    $('#verb-display').innerHTML=displayVerb(); $('#verb-reading').textContent=verb.reading;
    $('#verb-romaji').textContent=verb.romaji;
    $('#verb-meaning').textContent=verb.meaning; $('#verb-group').textContent=`${verb.jlpt} · ${verb.group} verb`;
    const adaptiveSession=(state.difficulty==='adaptive'&&state.verbSource==='difficulty')||state.practiceMode==='adaptive';
    $('#adaptive-level-panel').classList.toggle('hidden',!adaptiveSession);$('#adaptive-level-value').textContent=verb.jlpt;$('#adaptive-level-note').textContent=saved.adaptiveFeedback.easy||saved.adaptiveFeedback.hard?'Your level includes your previous skip feedback.':'Use skip feedback if this level does not feel right.';
    const verbReason=state.difficulty==='adaptive'&&state.verbSource==='difficulty'?`${state.adaptiveReason} `:'';
    $('#companion-message').textContent=state.practiceMode==='adaptive'?`${verbReason}${state.formReason}`:verbReason||`One verb, ${FORM_COUNT} core forms. We’ll work through them in order.`;
    renderMap(); renderCurrentForm(); updateProgress(); updateConjugationGuide(); show('game');
    playSound('start');
  }

  function renderCurrentForm(){
    const i=state.current,f=ACTIVE_FORMS[i];
    $('#challenge-title').textContent=f.name;
    $('#form-description').innerHTML=`<strong>${f.simple}</strong><span>${f.prompt}</span>`;
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
  function katsuHint(i,value){
    const f=ACTIVE_FORMS[i],a=state.verb.forms[f.id],tries=state.attempts[i],typed=normalize(value);
    if(!typed)return `No rush—give me your best guess first. We’re changing ${state.verb.kanji} into the ${f.name.toLowerCase()}.`;
    if(tries===1)return `Good attempt. Let’s slow the transformation down: ${state.verb.kanji} is a ${state.verb.group} verb, so listen for the ending change. ${a.rule}`;
    if(tries===2)return `You’re getting warmer. Keep the stable part of the verb, then rebuild the ending. I’ve put the pieces in the hint below—try saying them aloud before typing.`;
    if(tries===3)return `Almost there! Compare your answer with the filled-in pattern below. Only one small sound or character needs your attention.`;
    return `Let’s learn it together: the answer is ${a.answer}. Type it once yourself, and I’ll help you remember the pattern next time.`;
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
    const nativeExampleOverrides={
      'つむ:mashita':{
        japanese:'財布を家に忘れて、完全に詰みました。',
        hiragana:'さいふをいえにわすれて、かんぜんにつみました。',
        english:"I left my wallet at home, so I’m completely stuck.",
        thai:'ลืมกระเป๋าสตางค์ไว้ที่บ้าน เลยไปต่อไม่ได้เลย'
      }
    };
    const nativeExample=nativeExampleOverrides[`${verb.reading}:${formId}`];
    if(nativeExample)return nativeExample;
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
      playSound('wrong');
      const typing=typingGuide(i);
      const message=hint(i,input.value); input.classList.add('wrong'); setTimeout(()=>input.classList.remove('wrong'),400);
      feedback.className='form-question-feedback error'; feedback.innerHTML=`${message}<span class="romaji-type-guide">Phone or keyboard: type <code>${typing.romaji}</code> to produce <span lang="ja">${typing.kana}</span>.</span>`; $('#companion-message').textContent=`${katsuHint(i,input.value)} Type “${typing.romaji}” with a Japanese romaji keyboard.`;
      animateMascot(state.attempts[i]===1?'thinking':'hinting');
      saved.misses[ACTIVE_FORMS[i].id]=(saved.misses[ACTIVE_FORMS[i].id]||0)+1;persist();return;
    }
    const formId=ACTIVE_FORMS[i].id,a=state.verb.forms[formId]; state.solved[i]=true; state.firstTry[i]=state.attempts[i]===1;
    playSound('correct');
    const stats=saved.formStats[formId]||{rounds:0,firstTry:0,attempts:0};stats.rounds++;stats.attempts+=state.attempts[i];if(state.firstTry[i])stats.firstTry++;saved.formStats[formId]=stats;persist();
    input.value=a.answer;input.disabled=true;input.className='correct';form.querySelector('button').disabled=true;form.classList.add('solved');
    feedback.className='form-question-feedback';feedback.textContent='✓ Correct!';
    const example=exampleDetails(ACTIVE_FORMS[i].id,a.answer,state.verb),typing=typingGuide(i);
    form.insertAdjacentHTML('beforeend',`<details class="answer-insight"><summary>See example & explanation <span>＋</span></summary><div class="romaji-type-guide">HOW TO TYPE · <code>${typing.romaji}</code> → <span lang="ja">${typing.kana}</span><br><small>Choose the Japanese romaji keyboard on your phone or computer, then type the letters shown.</small></div><div class="example-sentence"><span>REAL-LIFE EXAMPLE</span><p lang="ja">${example.japanese}</p><dl><div><dt>ひらがな</dt><dd lang="ja">${example.hiragana}</dd></div><div><dt>English</dt><dd>${example.english}</dd></div><div><dt>ไทย</dt><dd lang="th">${example.thai}</dd></div></dl></div><p class="mini-explanation">${a.explanation}<br><strong>${a.rule}</strong></p></details>`);
    $('#companion-message').textContent=state.firstTry[i]?['That was instant recall—beautiful! Ready for the next transformation?','Exactly right on your first try. Your pattern memory is getting stronger!','正解！ You spotted the ending change immediately.'][i%3]:`Yes—that’s it! You worked through the clue and built ${a.answer} yourself. That recovery is how the pattern sticks.`;
    animateMascot('cheering',true);
    celebrateFrom(form.querySelector('.submit-answer'));
    $('#finish-button').innerHTML=i===FORM_COUNT-1?'See round results <span>→</span>':'Next form <span>→</span>';
    $('#finish-button').classList.remove('hidden');
    $('#finish-button').focus();
    updateProgress();
  }

  function nextForm(){
    if(state.current===FORM_COUNT-1){finish();return;}
    playSound('next');
    state.current++;
    renderCurrentForm();
    updateProgress();
    $('#companion-message').textContent=`Next: ${ACTIVE_FORMS[state.current].name}. Keep the ${state.verb.group} pattern in mind.`;
    animateMascot('idle');
  }

  function finish(){
    playSound('complete');
    const today=new Date().toISOString().slice(0,10), total=state.attempts.reduce((a,b)=>a+b,0), score=state.firstTry.filter(Boolean).length;
    if(saved.lastPlayed!==today){const y=new Date(Date.now()-86400000).toISOString().slice(0,10);saved.streak=saved.lastPlayed===y?saved.streak+1:1;saved.lastPlayed=today;}
    saved.history.unshift({date:today,verb:state.verb.kanji,jlpt:state.verb.jlpt,attempts:total,firstTry:score,formCount:FORM_COUNT,practiceMode:state.practiceMode,formIds:ACTIVE_FORMS.map(f=>f.id)});saved.history=saved.history.slice(0,20);persist();
    const max=Math.max(...state.attempts), tough=max>1?ACTIVE_FORMS[state.attempts.indexOf(max)]:null;
    $('#accuracy-score').textContent=`${score}/${FORM_COUNT}`;$('#attempt-score').textContent=total;$('#toughest-score').textContent=tough?tough.name:'None';$('#toughest-note').textContent=tough?`${max} attempts`:'Smooth round';
    $('#summary-verb').textContent=`${state.verb.kanji} · ${state.verb.meaning}`;$('#results-subtitle').textContent=`You completed all ${FORM_COUNT} forms of ${state.verb.kanji}.`;
    $('#summary-list').innerHTML=ACTIVE_FORMS.map((f,i)=>{const a=state.verb.forms[f.id],ex=exampleDetails(f.id,a.answer,state.verb);return `<details class="summary-row"><summary><span>${f.name}</span><strong>${a.answer}</strong><b>${state.firstTry[i]?'✓':`${state.attempts[i]} tries`}</b></summary><div class="summary-explanation"><div class="summary-example"><strong lang="ja">${ex.japanese}</strong><br><span lang="ja">${ex.hiragana}</span><br>${ex.english}<br><span lang="th">${ex.thai}</span></div>${a.explanation}<br><strong>${a.rule}</strong></div></details>`}).join('');
    $('#results-message').textContent=tough?`Good work. Let’s revisit ${tough.name.toLowerCase()} next round.`:'A clean round—you recalled every form first time!';
    $('#weak-title').textContent=tough?tough.name:'Try a new verb group';$('#weak-description').textContent=tough?state.verb.forms[tough.id].rule:'Keep your transformation rules flexible.';
    updateHeader();show('results');animateMascot('cheering');
  }

  function adjustAdaptiveLevel(direction){
    const current=Math.max(0,JLPT_LEVELS.indexOf(state.verb.jlpt)),next=Math.max(0,Math.min(JLPT_LEVELS.length-1,current+direction));
    const kind=direction>0?'easy':'hard';saved.adaptiveFeedback[kind]=(saved.adaptiveFeedback[kind]||0)+1;saved.adaptiveLevel=next;persist();
    if(next===current){$('#adaptive-level-note').textContent=direction>0?'You are already at the highest available level.':'You are already at the foundation level.';playSound('wrong');return;}
    const pool=VERBS.filter(v=>v.jlpt===JLPT_LEVELS[next]&&v.id!==state.verb.id),verb=pool[Math.floor(Math.random()*pool.length)]||state.verb;
    state.difficulty='adaptive';state.verbSource='difficulty';state.adaptiveReason=`You marked ${JLPT_LEVELS[current]} as ${direction>0?'too easy':'too difficult'}, so Katsu moved the test to ${JLPT_LEVELS[next]}.`;
    playSound('next');startRound(verb,false);
  }

  function updateHeader(){$('#streak-count').textContent=saved.streak;$('#sound-toggle').setAttribute('aria-pressed',String(saved.sound));$('#sound-toggle').setAttribute('aria-label',saved.sound?'Turn sound off':'Turn sound on');$('#sound-toggle').title=saved.sound?'Sound on':'Sound off';$('#sound-toggle span').textContent=saved.sound?'♪':'×';$('#sound-volume').value=saved.soundVolume;$('#volume-value').value=`${saved.soundVolume}%`;applyTheme(saved.theme||systemTheme);}
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
    $('#custom-verb-error').textContent='';state.difficulty=d.get('difficulty');state.verbSource=source;state.practiceMode=d.get('practiceMode');saved.reading=d.get('reading');saved.practiceMode=state.practiceMode;persist();startRound(choose(state.difficulty,null,source));
  });
  $('#forms-grid').addEventListener('click',e=>{if(e.target.closest('#finish-button'))nextForm();});$('#quit-button').addEventListener('click',()=>{location.href='index.html';});
  $('#reading-toggle').addEventListener('click',()=>{saved.reading=saved.reading==='kanji'?'hiragana':'kanji';persist();$('#verb-display').innerHTML=displayVerb();$('#reading-toggle').textContent=saved.reading==='kanji'?'漢 Kanji only':'ふ Furigana';});
  $('#retry-button').addEventListener('click',()=>startRound(state.verb,true));$('#new-verb-button').addEventListener('click',()=>startRound(choose(state.difficulty,state.verb.id,state.verbSource)));
  $('#expand-all').addEventListener('click',e=>{const rows=[...document.querySelectorAll('.summary-row')],open=rows.some(r=>!r.open);rows.forEach(r=>r.open=open);e.currentTarget.textContent=open?'Collapse all':'Expand all';});
  $('#sound-toggle').addEventListener('click',()=>{saved.sound=!saved.sound;persist();updateHeader();if(saved.sound)playSound('toggle');});
  $('#sound-volume').addEventListener('input',e=>{saved.soundVolume=Number(e.target.value);if(saved.soundVolume>0)saved.sound=true;$('#volume-value').value=`${saved.soundVolume}%`;persist();updateHeader();});
  $('#sound-volume').addEventListener('change',()=>playSound('toggle'));
  $('#level-too-easy').addEventListener('click',()=>adjustAdaptiveLevel(1));
  $('#level-too-hard').addEventListener('click',()=>adjustAdaptiveLevel(-1));
  $('#theme-toggle').addEventListener('click',()=>{saved.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';persist();applyTheme(saved.theme);});
  $('#history-button').addEventListener('click',()=>{$('#history-content').innerHTML=saved.history.length?saved.history.map(x=>`<div class="history-item"><span><strong>${x.verb}</strong> ${x.jlpt?`<small>${x.jlpt}</small>`:''}<br>${x.date}</span><span>${x.firstTry}/${x.formCount||7} first try<br>${x.attempts} attempts</span></div>`).join(''):'<p class="history-empty">Complete your first quest to start a practice history.</p>';$('#history-dialog').showModal();});
  $('.dialog-close').addEventListener('click',()=>$('#history-dialog').close());
  $('#verb-source').addEventListener('change',e=>$('#custom-verbs').classList.toggle('hidden',e.target.value!=='custom'));
  $('#verb-search').addEventListener('input',filterCustomVerbs);
  $('.catalog-filters').addEventListener('change',filterCustomVerbs);
  $('#custom-verb-list').addEventListener('change',filterCustomVerbs);
  document.querySelectorAll('[name="practiceMode"]').forEach(input=>input.addEventListener('change',()=>{$('#setup-note').textContent=input.value==='adaptive'?'1 verb · 7 AI-selected conjugations':'1 verb · 19 core conjugations';}));
  $('#select-visible').addEventListener('click',()=>{$('#custom-verb-list').querySelectorAll('label:not(.hidden) input').forEach(input=>input.checked=true);filterCustomVerbs();});
  $('#clear-custom').addEventListener('click',()=>{$('#custom-verb-list').querySelectorAll('input').forEach(input=>input.checked=false);filterCustomVerbs();});
  $('#guide-toggle').addEventListener('click',e=>{const content=$('#guide-content'),hidden=content.classList.toggle('hidden');e.currentTarget.textContent=hidden?'Show reference ＋':'Hide reference −';e.currentTarget.setAttribute('aria-expanded',String(!hidden));});
  $('#map-toggle').addEventListener('click',e=>{const list=$('#form-map-list'),hidden=list.classList.toggle('hidden');e.currentTarget.textContent=hidden?'Show ＋':'Hide −';e.currentTarget.setAttribute('aria-expanded',String(!hidden));});
  $('#summary-toggle').addEventListener('click',e=>{const list=$('#summary-list'),hidden=list.classList.toggle('hidden');$('#expand-all').classList.toggle('hidden',hidden);e.currentTarget.textContent=hidden?'Show table ＋':'Hide table −';e.currentTarget.setAttribute('aria-expanded',String(!hidden));});
  document.addEventListener('pointerdown',e=>{const button=e.target.closest('button');if(!button||button.disabled)return;const ripple=document.createElement('span'),rect=button.getBoundingClientRect();ripple.className='button-ripple';ripple.style.left=`${e.clientX-rect.left}px`;ripple.style.top=`${e.clientY-rect.top}px`;button.appendChild(ripple);setTimeout(()=>ripple.remove(),560);});
  document.addEventListener('keydown',e=>{
    if(e.key!=='Enter'||screens.game.classList.contains('hidden')||$('#finish-button').classList.contains('hidden'))return;
    if(e.target.closest('#history-dialog'))return;
    e.preventDefault();
    nextForm();
  });
  buildVerbSelector();
  document.querySelector(`input[name="reading"][value="${saved.reading}"]`).checked=true;
  const savedPracticeMode=document.querySelector(`input[name="practiceMode"][value="${saved.practiceMode}"]`);if(savedPracticeMode){savedPracticeMode.checked=true;$('#setup-note').textContent=saved.practiceMode==='adaptive'?'1 verb · 7 AI-selected conjugations':'1 verb · 19 core conjugations';}
  $('#reading-toggle').textContent=saved.reading==='kanji'?'漢 Kanji only':'ふ Furigana';
  updateHeader();
})();
