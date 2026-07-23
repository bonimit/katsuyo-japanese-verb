const FORMS = [
  { id: 'masu', name: 'Polite present', short: 'ます', prompt: 'Use the ます form.' },
  { id: 'masen', name: 'Polite negative', short: 'ません', prompt: 'Say it politely in the negative.' },
  { id: 'mashita', name: 'Polite past', short: 'ました', prompt: 'Put the polite form in the past.' },
  { id: 'masendeshita', name: 'Polite past negative', short: 'ませんでした', prompt: 'Say it politely: did not…' },
  { id: 'nai', name: 'Plain negative', short: 'ない', prompt: 'Use the casual negative form.' },
  { id: 'ta', name: 'Plain past', short: 'た', prompt: 'Use the casual past form.' },
  { id: 'te', name: 'て form', short: 'て', prompt: 'Connect it with the て form.' },
  { id: 'potential', name: 'Potential form', short: '可能', prompt: 'Say “can do” this verb.' },
  { id: 'passive', name: 'Passive form', short: '受身', prompt: 'Form the passive.' },
  { id: 'causative', name: 'Causative form', short: '使役', prompt: 'Say “make or let someone do.”' },
  { id: 'causativePassive', name: 'Causative-passive', short: '使役受身', prompt: 'Say “be made to do.”' },
  { id: 'volitional', name: 'Plain volitional', short: '意向', prompt: 'Say “let’s do.”' },
  { id: 'politeVolitional', name: 'Polite volitional', short: 'ましょう', prompt: 'Say “let’s do” politely.' },
  { id: 'imperative', name: 'Imperative', short: '命令', prompt: 'Give a direct command.' },
  { id: 'ba', name: 'ば conditional', short: '〜ば', prompt: 'Say “if one does.”' },
  { id: 'tara', name: 'たら conditional', short: '〜たら', prompt: 'Say “if/when one does.”' },
  { id: 'tai', name: 'Desire form', short: '〜たい', prompt: 'Say “want to do.”' },
  { id: 'negativeTe', name: 'Negative て form', short: 'なくて', prompt: 'Connect the negative form.' },
  { id: 'prohibitive', name: 'Negative command', short: '〜な', prompt: 'Say “do not do.”' }
];

const V = (answer, breakdown, rule, explanation, alternatives = []) => ({ answer, alternatives, breakdown, rule, explanation });

const VERBS = [
  {
    id: 'taberu', kanji: '食べる', reading: 'たべる', furigana: '<ruby>食<rt>た</rt>べる</ruby>', meaning: 'to eat', group: 'Ichidan', difficulty: 'beginner', jlpt: 'N5',
    forms: {
      masu: V('食べます', ['食べ', 'ます'], 'Remove る + ます', '食べる is an Ichidan verb. Remove the final る and add ます.', ['たべます']),
      masen: V('食べません', ['食べ', 'ません'], 'Remove る + ません', 'Remove る from the Ichidan verb and add ません.', ['たべません']),
      mashita: V('食べました', ['食べ', 'ました'], 'Remove る + ました', 'Remove る and add the polite past ending ました.', ['たべました']),
      masendeshita: V('食べませんでした', ['食べ', 'ませんでした'], 'Remove る + ませんでした', 'Remove る and add ませんでした for the polite past negative.', ['たべませんでした']),
      nai: V('食べない', ['食べ', 'ない'], 'Remove る + ない', 'Ichidan verbs form the negative by removing る and adding ない.', ['たべない']),
      ta: V('食べた', ['食べ', 'た'], 'Remove る + た', 'For Ichidan verbs, remove る and add た.', ['たべた']),
      te: V('食べて', ['食べ', 'て'], 'Remove る + て', 'For Ichidan verbs, remove る and add て.', ['たべて']),
      potential: V('食べられる', ['食べ', 'られる'], 'Remove る + られる', 'The standard Ichidan potential form removes る and adds られる.', ['たべられる', '食べれる', 'たべれる'])
    }
  },
  {
    id: 'yomu', kanji: '読む', reading: 'よむ', furigana: '<ruby>読<rt>よ</rt>む</ruby>', meaning: 'to read', group: 'Godan', difficulty: 'beginner', jlpt: 'N5',
    forms: {
      masu: V('読みます', ['読', 'みます'], 'む → み + ます', 'Change the final む to its い-row sound み, then add ます.', ['よみます']),
      masen: V('読みません', ['読', 'みません'], 'む → み + ません', 'Change む to み and add ません.', ['よみません']),
      mashita: V('読みました', ['読', 'みました'], 'む → み + ました', 'Change む to み and add ました.', ['よみました']),
      masendeshita: V('読みませんでした', ['読', 'みませんでした'], 'む → み + ませんでした', 'Change む to み and add ませんでした.', ['よみませんでした']),
      nai: V('読まない', ['読', 'まない'], 'む → ま + ない', 'For the plain negative, change む to the あ-row sound ま and add ない.', ['よまない']),
      ta: V('読んだ', ['読', 'んだ'], 'む・ぶ・ぬ → んだ', 'Godan verbs ending in む, ぶ, or ぬ use んだ in the plain past.', ['よんだ']),
      te: V('読んで', ['読', 'んで'], 'む・ぶ・ぬ → んで', 'Godan verbs ending in む, ぶ, or ぬ use んで in the て form.', ['よんで']),
      potential: V('読める', ['読', 'める'], 'む → める', 'Change the final む to its え-row sound め and add る.', ['よめる'])
    }
  },
  {
    id: 'kaku', kanji: '書く', reading: 'かく', furigana: '<ruby>書<rt>か</rt>く</ruby>', meaning: 'to write', group: 'Godan', difficulty: 'beginner', jlpt: 'N5',
    forms: {
      masu: V('書きます', ['書', 'きます'], 'く → き + ます', 'Change く to き and add ます.', ['かきます']), masen: V('書きません', ['書', 'きません'], 'く → き + ません', 'Change く to き and add ません.', ['かきません']), mashita: V('書きました', ['書', 'きました'], 'く → き + ました', 'Change く to き and add ました.', ['かきました']), masendeshita: V('書きませんでした', ['書', 'きませんでした'], 'く → き + ませんでした', 'Change く to き and add ませんでした.', ['かきませんでした']), nai: V('書かない', ['書', 'かない'], 'く → か + ない', 'Change く to か and add ない.', ['かかない']), ta: V('書いた', ['書', 'いた'], 'く → いた', 'Godan verbs ending in く usually change to いた.', ['かいた']), te: V('書いて', ['書', 'いて'], 'く → いて', 'Godan verbs ending in く usually change to いて.', ['かいて']), potential: V('書ける', ['書', 'ける'], 'く → ける', 'Change く to the え-row sound け and add る.', ['かける'])
    }
  },
  {
    id: 'iku', kanji: '行く', reading: 'いく', furigana: '<ruby>行<rt>い</rt>く</ruby>', meaning: 'to go', group: 'Godan · exception', difficulty: 'intermediate', jlpt: 'N5',
    forms: {
      masu: V('行きます', ['行', 'きます'], 'く → き + ます', 'Change く to き and add ます.', ['いきます']), masen: V('行きません', ['行', 'きません'], 'く → き + ません', 'Change く to き and add ません.', ['いきません']), mashita: V('行きました', ['行', 'きました'], 'く → き + ました', 'Change く to き and add ました.', ['いきました']), masendeshita: V('行きませんでした', ['行', 'きませんでした'], 'く → き + ませんでした', 'Change く to き and add ませんでした.', ['いきませんでした']), nai: V('行かない', ['行', 'かない'], 'く → か + ない', 'Change く to か and add ない.', ['いかない']), ta: V('行った', ['行', 'った'], 'Exception: 行く → 行った', '行く is the important exception: its plain past is 行った, not 行いた.', ['いった']), te: V('行って', ['行', 'って'], 'Exception: 行く → 行って', '行く is the important exception: its て form is 行って, not 行いて.', ['いって']), potential: V('行ける', ['行', 'ける'], 'く → ける', 'Change く to け and add る.', ['いける'])
    }
  },
  {
    id: 'suru', kanji: 'する', reading: 'する', furigana: 'する', meaning: 'to do', group: 'Irregular', difficulty: 'intermediate', jlpt: 'N5',
    forms: {
      masu: V('します', ['し', 'ます'], 'Irregular: する → し', 'する uses the irregular stem し before polite endings.'), masen: V('しません', ['し', 'ません'], 'Irregular: する → し', 'Use the irregular stem し and add ません.'), mashita: V('しました', ['し', 'ました'], 'Irregular: する → し', 'Use the irregular stem し and add ました.'), masendeshita: V('しませんでした', ['し', 'ませんでした'], 'Irregular: する → し', 'Use し and add ませんでした.'), nai: V('しない', ['し', 'ない'], 'Irregular: する → しない', 'The plain negative of する is irregular: しない.'), ta: V('した', ['し', 'た'], 'Irregular: する → した', 'The plain past of する is した.'), te: V('して', ['し', 'て'], 'Irregular: する → して', 'The て form of する is して.'), potential: V('できる', ['できる'], 'Irregular potential', 'The potential form of する is the separate verb できる.', ['出来る'])
    }
  },
  {
    id: 'kuru', kanji: '来る', reading: 'くる', furigana: '<ruby>来<rt>く</rt>る</ruby>', meaning: 'to come', group: 'Irregular', difficulty: 'intermediate', jlpt: 'N5',
    forms: {
      masu: V('来ます', ['来', 'ます'], 'Irregular: くる → きます', '来る changes its reading to き before polite endings.', ['きます']), masen: V('来ません', ['来', 'ません'], 'Irregular: くる → きません', 'Use the irregular stem き and add ません.', ['きません']), mashita: V('来ました', ['来', 'ました'], 'Irregular: くる → きました', 'Use the irregular stem き and add ました.', ['きました']), masendeshita: V('来ませんでした', ['来', 'ませんでした'], 'Irregular: くる → きませんでした', 'Use き and add ませんでした.', ['きませんでした']), nai: V('来ない', ['来', 'ない'], 'Irregular: くる → こない', 'The negative stem changes to こ: 来ない is read こない.', ['こない']), ta: V('来た', ['来', 'た'], 'Irregular: くる → きた', 'The plain past is 来た, read きた.', ['きた']), te: V('来て', ['来', 'て'], 'Irregular: くる → きて', 'The て form is 来て, read きて.', ['きて']), potential: V('来られる', ['来', 'られる'], 'Irregular: くる → こられる', 'The standard potential is 来られる, read こられる.', ['こられる', '来れる', 'これる'])
    }
  }
];

// Expandable study library. JLPT assignments are common teaching estimates.
const STUDY_VERBS = [
  ['miru','見る','みる','to see','Ichidan','N5'],['okiru','起きる','おきる','to wake up','Ichidan','N5'],
  ['kau','買う','かう','to buy','Godan','N5'],['hanasu','話す','はなす','to speak','Godan','N5'],
  ['akeru','開ける','あける','to open','Ichidan','N4'],['shimeru','閉める','しめる','to close','Ichidan','N4'],
  ['oyogu','泳ぐ','およぐ','to swim','Godan','N4'],['matsu','待つ','まつ','to wait','Godan','N4'],
  ['tsuzukeru','続ける','つづける','to continue','Ichidan','N3'],['kimeru','決める','きめる','to decide','Ichidan','N3'],
  ['erabu','選ぶ','えらぶ','to choose','Godan','N3'],['modoru','戻る','もどる','to return','Godan','N3'],
  ['mitomeru','認める','みとめる','to recognize','Ichidan','N2'],['kuwaeru','加える','くわえる','to add','Ichidan','N2'],
  ['okonau','行う','おこなう','to conduct','Godan','N2'],['ushinau','失う','うしなう','to lose','Godan','N2'],
  ['kokoromiru','試みる','こころみる','to attempt','Ichidan','N1'],['sazukeru','授ける','さずける','to grant','Ichidan','N1'],
  ['azukaru','預かる','あずかる','to take custody','Godan','N1'],['tsuranuku','貫く','つらぬく','to carry through','Godan','N1']
];

const GODAN_ROWS = {
  'う':['わ','い','え'], 'く':['か','き','け'], 'ぐ':['が','ぎ','げ'], 'す':['さ','し','せ'],
  'つ':['た','ち','て'], 'ぬ':['な','に','ね'], 'ぶ':['ば','び','べ'], 'む':['ま','み','め'], 'る':['ら','り','れ']
};
const TE_TA = {'う':['って','った'],'つ':['って','った'],'る':['って','った'],'む':['んで','んだ'],'ぶ':['んで','んだ'],'ぬ':['んで','んだ'],'く':['いて','いた'],'ぐ':['いで','いだ'],'す':['して','した']};

function kanaToRomaji(kana){
  const pairs={'きゃ':'kya','きゅ':'kyu','きょ':'kyo','しゃ':'sha','しゅ':'shu','しょ':'sho','ちゃ':'cha','ちゅ':'chu','ちょ':'cho','にゃ':'nya','にゅ':'nyu','にょ':'nyo','ひゃ':'hya','ひゅ':'hyu','ひょ':'hyo','みゃ':'mya','みゅ':'myu','みょ':'myo','りゃ':'rya','りゅ':'ryu','りょ':'ryo','ぎゃ':'gya','ぎゅ':'gyu','ぎょ':'gyo','じゃ':'ja','じゅ':'ju','じょ':'jo','びゃ':'bya','びゅ':'byu','びょ':'byo','ぴゃ':'pya','ぴゅ':'pyu','ぴょ':'pyo'};
  const mono={'あ':'a','い':'i','う':'u','え':'e','お':'o','か':'ka','き':'ki','く':'ku','け':'ke','こ':'ko','さ':'sa','し':'shi','す':'su','せ':'se','そ':'so','た':'ta','ち':'chi','つ':'tsu','て':'te','と':'to','な':'na','に':'ni','ぬ':'nu','ね':'ne','の':'no','は':'ha','ひ':'hi','ふ':'fu','へ':'he','ほ':'ho','ま':'ma','み':'mi','む':'mu','め':'me','も':'mo','や':'ya','ゆ':'yu','よ':'yo','ら':'ra','り':'ri','る':'ru','れ':'re','ろ':'ro','わ':'wa','を':'o','ん':'n','が':'ga','ぎ':'gi','ぐ':'gu','げ':'ge','ご':'go','ざ':'za','じ':'ji','ず':'zu','ぜ':'ze','ぞ':'zo','だ':'da','ぢ':'ji','づ':'zu','で':'de','ど':'do','ば':'ba','び':'bi','ぶ':'bu','べ':'be','ぼ':'bo','ぱ':'pa','ぴ':'pi','ぷ':'pu','ぺ':'pe','ぽ':'po'};
  let out='',double=false;
  for(let i=0;i<kana.length;i++){if(kana[i]==='っ'){double=true;continue;}const pair=kana.slice(i,i+2),roma=pairs[pair]||mono[kana[i]]||kana[i];if(pairs[pair])i++;if(double){out+=(roma.match(/^[a-z]/)||[''])[0];double=false;}out+=roma;}
  return out;
}

function generatedVerb([id,kanji,reading,meaning,group,jlpt]){
  // EDICT may append priority/usage markers such as (P) to the written form.
  // They are dictionary metadata, not part of the Japanese spelling.
  kanji=kanji.replace(/\([^)]*\)/g,'').trim();
  const end=reading.slice(-1), base=reading.slice(0,-1);
  let masu,masen,mashita,masendeshita,nai,ta,te,potential;
  if(group==='Ichidan'){
    masu=base+'ます';masen=base+'ません';mashita=base+'ました';masendeshita=base+'ませんでした';
    nai=base+'ない';ta=base+'た';te=base+'て';potential=base+'られる';
  }else{
    const [a,i,e]=GODAN_ROWS[end];
    masu=base+i+'ます';masen=base+i+'ません';mashita=base+i+'ました';masendeshita=base+i+'ませんでした';
    nai=base+a+'ない';te=base+TE_TA[end][0];ta=base+TE_TA[end][1];potential=base+e+'る';
  }
  const hasKanji=/[一-龯々]/.test(kanji);
  const writtenBase=hasKanji && kanji.endsWith(end) ? kanji.slice(0,-1) : '';
  const make=(kanaAnswer,rule)=>{
    const changedEnding=kanaAnswer.slice(base.length);
    const writtenAnswer=writtenBase ? writtenBase+changedEnding : kanaAnswer;
    const alternatives=writtenAnswer===kanaAnswer?[]:[kanaAnswer];
    return V(writtenAnswer,[writtenBase||base,changedEnding],rule,`${kanji} (${reading}) is a ${group} verb. Apply the ${rule} pattern.`,alternatives);
  };
  return {id,kanji,reading,furigana:kanji,meaning,group,difficulty:jlpt==='N5'?'beginner':'intermediate',jlpt,forms:{
    masu:make(masu,group==='Ichidan'?'remove る + ます':`${end} → い-row + ます`),
    masen:make(masen,group==='Ichidan'?'remove る + ません':`${end} → い-row + ません`),
    mashita:make(mashita,group==='Ichidan'?'remove る + ました':`${end} → い-row + ました`),
    masendeshita:make(masendeshita,group==='Ichidan'?'remove る + ませんでした':`${end} → い-row + ませんでした`),
    nai:make(nai,group==='Ichidan'?'remove る + ない':`${end} → あ-row + ない`),
    ta:make(ta,group==='Ichidan'?'remove る + た':`${end} sound change → ${ta.slice(base.length)}`),
    te:make(te,group==='Ichidan'?'remove る + て':`${end} sound change → ${te.slice(base.length)}`),
    potential:make(potential,group==='Ichidan'?'remove る + られる':`${end} → え-row + る`)
  }};
}
VERBS.push(...STUDY_VERBS.map(generatedVerb));
const existingReadings = new Set(VERBS.map(v => v.reading));
VERBS.push(...DICTIONARY_VERBS
  .filter(v => !existingReadings.has(v.reading) && (v.group === 'Ichidan' || GODAN_ROWS[v.reading.slice(-1)]))
  .map(v => generatedVerb([v.id, v.kanji, v.reading, v.meaning, v.group, v.jlpt])));
VERBS.forEach(v => { v.romaji = kanaToRomaji(v.reading); });

const GODAN_O = {'う':'お','く':'こ','ぐ':'ご','す':'そ','つ':'と','ぬ':'の','ぶ':'ぼ','む':'も','る':'ろ'};
function addExtendedForms(v){
  const reading=v.reading,end=reading.slice(-1),base=reading.slice(0,-1);
  const writtenBase=/[一-龯々]/.test(v.kanji)&&v.kanji.endsWith(end)?v.kanji.slice(0,-1):'';
  const add=(id,kanaAnswer,rule,kanjiAnswer)=>{
    const suffix=kanaAnswer.startsWith(base)?kanaAnswer.slice(base.length):kanaAnswer;
    const answer=kanjiAnswer||(writtenBase&&kanaAnswer.startsWith(base)?writtenBase+suffix:kanaAnswer);
    v.forms[id]=V(answer,[answer.slice(0,Math.max(1,answer.length-suffix.length)),suffix],rule,`${v.kanji} (${reading}) uses ${rule}.`,answer===kanaAnswer?[]:[kanaAnswer]);
  };
  if(v.id==='suru'){
    [['passive','される'],['causative','させる'],['causativePassive','させられる'],['volitional','しよう'],['politeVolitional','しましょう'],['imperative','しろ'],['ba','すれば'],['tara','したら'],['tai','したい'],['negativeTe','しなくて'],['prohibitive','するな']].forEach(([id,a])=>add(id,a,'the irregular する pattern'));
  }else if(v.id==='kuru'){
    const forms={passive:['来られる','こられる'],causative:['来させる','こさせる'],causativePassive:['来させられる','こさせられる'],volitional:['来よう','こよう'],politeVolitional:['来ましょう','きましょう'],imperative:['来い','こい'],ba:['来れば','くれば'],tara:['来たら','きたら'],tai:['来たい','きたい'],negativeTe:['来なくて','こなくて'],prohibitive:['来るな','くるな']};
    Object.entries(forms).forEach(([id,[k,a]])=>add(id,a,'the irregular 来る pattern',k));
  }else if(v.group.startsWith('Ichidan')){
    add('passive',base+'られる','remove る + られる');add('causative',base+'させる','remove る + させる');add('causativePassive',base+'させられる','remove る + させられる');
    add('volitional',base+'よう','remove る + よう');add('politeVolitional',base+'ましょう','remove る + ましょう');add('imperative',base+'ろ','remove る + ろ');
    add('ba',base+'れば','remove る + れば');add('tara',v.forms.ta.alternatives[0]?v.forms.ta.alternatives[0]+'ら':base+'たら','plain past + ら');
    add('tai',base+'たい','remove る + たい');add('negativeTe',base+'なくて','remove る + なくて');add('prohibitive',reading+'な','dictionary form + な');
  }else{
    const [a,i,e]=GODAN_ROWS[end],o=GODAN_O[end];
    add('passive',base+a+'れる',`${end} → あ-row + れる`);add('causative',base+a+'せる',`${end} → あ-row + せる`);add('causativePassive',base+a+'せられる',`${end} → あ-row + せられる`);
    add('volitional',base+o+'う',`${end} → お-row + う`);add('politeVolitional',base+i+'ましょう',`${end} → い-row + ましょう`);add('imperative',base+e,`${end} → え-row`);
    add('ba',base+e+'ば',`${end} → え-row + ば`);const kanaTa=v.forms.ta.alternatives[0]||v.forms.ta.answer;add('tara',kanaTa+'ら','plain past + ら');
    add('tai',base+i+'たい',`${end} → い-row + たい`);add('negativeTe',base+a+'なくて',`${end} → あ-row + なくて`);add('prohibitive',reading+'な','dictionary form + な');
  }
}
VERBS.forEach(addExtendedForms);
