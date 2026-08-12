(() => {
  'use strict';

  const readings = {
    '駅で': '<ruby>田中<rt>たなか</rt></ruby>さんは<ruby>毎朝<rt>まいあさ</rt></ruby><ruby>七時<rt>しちじ</rt></ruby>に<ruby>家<rt>いえ</rt></ruby>を<ruby>出<rt>で</rt></ruby>ます。<ruby>今日<rt>きょう</rt></ruby>は<ruby>雨<rt>あめ</rt></ruby>なので、<ruby>駅<rt>えき</rt></ruby>までバスで<ruby>行<rt>い</rt></ruby>きました。でも、バスが<ruby>少<rt>すこ</rt></ruby>し<ruby>遅<rt>おく</rt></ruby>れたので、いつもの<ruby>電車<rt>でんしゃ</rt></ruby>に<ruby>乗<rt>の</rt></ruby>れませんでした。',
    '今日のお昼': '<ruby>美香<rt>みか</rt></ruby>さんは<ruby>会社<rt>かいしゃ</rt></ruby>の<ruby>近<rt>ちか</rt></ruby>くのパン<ruby>屋<rt>や</rt></ruby>へ<ruby>行<rt>い</rt></ruby>きました。<ruby>新<rt>あたら</rt></ruby>しいサンドイッチを<ruby>買<rt>か</rt></ruby>いたかったですが、もう<ruby>売<rt>う</rt></ruby>り<ruby>切<rt>き</rt></ruby>れていました。それで、いつものカレーパンを<ruby>買<rt>か</rt></ruby>いました。',
    '待ち合わせ': '<ruby>友達<rt>ともだち</rt></ruby>から「<ruby>仕事<rt>しごと</rt></ruby>が<ruby>長引<rt>ながび</rt></ruby>いて、<ruby>十分<rt>じゅっぷん</rt></ruby>くらい<ruby>遅<rt>おく</rt></ruby>れそう」とメッセージが<ruby>来<rt>き</rt></ruby>ました。<ruby>私<rt>わたし</rt></ruby>はもう<ruby>駅<rt>えき</rt></ruby>に<ruby>着<rt>つ</rt></ruby>いていたので、<ruby>近<rt>ちか</rt></ruby>くの<ruby>本屋<rt>ほんや</rt></ruby>で<ruby>待<rt>ま</rt></ruby>つことにしました。',
    '荷物の受け取り': '<ruby>宅配便<rt>たくはいびん</rt></ruby>が<ruby>来<rt>く</rt></ruby>る<ruby>予定<rt>よてい</rt></ruby>でしたが、<ruby>買<rt>か</rt></ruby>い<ruby>物<rt>もの</rt></ruby>に<ruby>出<rt>で</rt></ruby>ている<ruby>間<rt>あいだ</rt></ruby>に<ruby>届<rt>とど</rt></ruby>いたようです。<ruby>玄関<rt>げんかん</rt></ruby>に<ruby>不在票<rt>ふざいひょう</rt></ruby>が<ruby>入<rt>はい</rt></ruby>っていたので、<ruby>夜<rt>よる</rt></ruby>の<ruby>時間<rt>じかん</rt></ruby>を<ruby>指定<rt>してい</rt></ruby>して<ruby>再配達<rt>さいはいたつ</rt></ruby>を<ruby>頼<rt>たの</rt></ruby>みました。',
    'いつもの席': 'よく<ruby>行<rt>い</rt></ruby>くカフェが<ruby>改装<rt>かいそう</rt></ruby>されて、<ruby>店内<rt>てんない</rt></ruby>がずいぶん<ruby>明<rt>あか</rt></ruby>るくなりました。<ruby>雰囲気<rt>ふんいき</rt></ruby>は<ruby>良<rt>よ</rt></ruby>くなったものの、<ruby>窓際<rt>まどぎわ</rt></ruby>にあったお<ruby>気<rt>き</rt></ruby>に<ruby>入<rt>い</rt></ruby>りの<ruby>席<rt>せき</rt></ruby>がなくなってしまい、<ruby>少<rt>すこ</rt></ruby>し<ruby>残念<rt>ざんねん</rt></ruby>です。',
    '会議の変更': '<ruby>午後<rt>ごご</rt></ruby>の<ruby>会議<rt>かいぎ</rt></ruby>は<ruby>三時<rt>さんじ</rt></ruby>からの<ruby>予定<rt>よてい</rt></ruby>でしたが、<ruby>取引先<rt>とりひきさき</rt></ruby>の<ruby>都合<rt>つごう</rt></ruby>で<ruby>四時半<rt>よじはん</rt></ruby>に<ruby>変更<rt>へんこう</rt></ruby>されました。そのため、<ruby>先<rt>さき</rt></ruby>に<ruby>資料<rt>しりょう</rt></ruby>を<ruby>確認<rt>かくにん</rt></ruby>してから、<ruby>遅<rt>おそ</rt></ruby>めの<ruby>昼休<rt>ひるやす</rt></ruby>みを<ruby>取<rt>と</rt></ruby>ることにしました。',
    '使っていないサービス': '<ruby>動画配信<rt>どうがはいしん</rt></ruby>サービスをいくつか<ruby>契約<rt>けいやく</rt></ruby>しているが、<ruby>最近<rt>さいきん</rt></ruby>は<ruby>忙<rt>いそが</rt></ruby>しくてほとんど<ruby>見<rt>み</rt></ruby>ていない。<ruby>料金<rt>りょうきん</rt></ruby>そのものは<ruby>高<rt>たか</rt></ruby>くないとはいえ、<ruby>使<rt>つか</rt></ruby>わないまま<ruby>払<rt>はら</rt></ruby>い<ruby>続<rt>つづ</rt></ruby>けるのももったいないので、<ruby>今月中<rt>こんげつじゅう</rt></ruby>に<ruby>整理<rt>せいり</rt></ruby>するつもりだ。',
    '在宅勤務の工夫': '<ruby>在宅勤務<rt>ざいたくきんむ</rt></ruby>は<ruby>通勤時間<rt>つうきんじかん</rt></ruby>を<ruby>省<rt>はぶ</rt></ruby>ける<ruby>一方<rt>いっぽう</rt></ruby>で、<ruby>仕事<rt>しごと</rt></ruby>と<ruby>私生活<rt>しせいかつ</rt></ruby>の<ruby>切<rt>き</rt></ruby>り<ruby>替<rt>か</rt></ruby>えが<ruby>難<rt>むずか</rt></ruby>しい。そこで、<ruby>仕事<rt>しごと</rt></ruby>を<ruby>始<rt>はじ</rt></ruby>める<ruby>前<rt>まえ</rt></ruby>に<ruby>短<rt>みじか</rt></ruby>い<ruby>散歩<rt>さんぽ</rt></ruby>をし、<ruby>終<rt>お</rt></ruby>わったら<ruby>机<rt>つくえ</rt></ruby>の<ruby>上<rt>うえ</rt></ruby>を<ruby>片<rt>かた</rt></ruby>づけるようにしている。',
    '口コミとの距離': '<ruby>店<rt>みせ</rt></ruby>を<ruby>選<rt>えら</rt></ruby>ぶ<ruby>際<rt>さい</rt></ruby>、<ruby>口<rt>くち</rt></ruby>コミは<ruby>便利<rt>べんり</rt></ruby>な<ruby>判断材料<rt>はんだんざいりょう</rt></ruby>になる。ただし、<ruby>評価<rt>ひょうか</rt></ruby>の<ruby>高低<rt>こうてい</rt></ruby>だけに<ruby>左右<rt>さゆう</rt></ruby>されると、<ruby>自分<rt>じぶん</rt></ruby>に<ruby>合<rt>あ</rt></ruby>うかどうかという<ruby>視点<rt>してん</rt></ruby>を<ruby>失<rt>うしな</rt></ruby>いかねない。<ruby>参考<rt>さんこう</rt></ruby>にはしても、<ruby>最終的<rt>さいしゅうてき</rt></ruby>には<ruby>自分<rt>じぶん</rt></ruby>の<ruby>目的<rt>もくてき</rt></ruby>に<ruby>照<rt>て</rt></ruby>らして<ruby>決<rt>き</rt></ruby>めたい。',
    '効率化の落とし穴': '<ruby>業務<rt>ぎょうむ</rt></ruby>の<ruby>効率化<rt>こうりつか</rt></ruby>は<ruby>重要<rt>じゅうよう</rt></ruby>だが、<ruby>数字<rt>すうじ</rt></ruby>で<ruby>測<rt>はか</rt></ruby>りやすい<ruby>作業時間<rt>さぎょうじかん</rt></ruby>ばかりを<ruby>短縮<rt>たんしゅく</rt></ruby>しようとすると、<ruby>相談<rt>そうだん</rt></ruby>や<ruby>振<rt>ふ</rt></ruby>り<ruby>返<rt>かえ</rt></ruby>りのような<ruby>成果<rt>せいか</rt></ruby>の<ruby>見<rt>み</rt></ruby>えにくい<ruby>活動<rt>かつどう</rt></ruby>が<ruby>後回<rt>あとまわ</rt></ruby>しになりがちだ。<ruby>結果<rt>けっか</rt></ruby>として、<ruby>長期的<rt>ちょうきてき</rt></ruby>な<ruby>改善<rt>かいぜん</rt></ruby>の<ruby>機会<rt>きかい</rt></ruby>を<ruby>逃<rt>のが</rt></ruby>す<ruby>可能性<rt>かのうせい</rt></ruby>もある。'
  };

  const button = document.querySelector('#reading-furigana');
  const passage = document.querySelector('#passage-japanese');
  const duplicate = document.querySelector('#passage-reading');
  if (!button || !passage) return;

  if (duplicate) duplicate.classList.add('hidden');
  button.setAttribute('aria-controls', 'passage-japanese');

  button.addEventListener('click', event => {
    event.stopImmediatePropagation();
    const show = button.getAttribute('aria-expanded') !== 'true';
    const title = document.querySelector('#passage-title')?.textContent || '';
    const plain = passage.dataset.plain || passage.textContent;
    passage.dataset.plain = plain;
    button.setAttribute('aria-expanded', String(show));
    button.querySelector('b').textContent = show ? 'Hide −' : 'Show ＋';
    passage.classList.toggle('with-furigana', show);
    if (show && readings[title]) passage.innerHTML = readings[title];
    else passage.textContent = plain;
  }, true);

  const observer = new MutationObserver(() => {
    if (button.getAttribute('aria-expanded') !== 'true') return;
    const title = document.querySelector('#passage-title')?.textContent || '';
    passage.dataset.plain = passage.textContent;
    if (readings[title]) passage.innerHTML = readings[title];
  });
  observer.observe(document.querySelector('#passage-title'), { childList: true });
})();
