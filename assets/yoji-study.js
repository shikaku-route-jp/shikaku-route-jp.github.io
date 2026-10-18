(function () {
  "use strict";

  // Meanings, memory hints and example sentences are original explanations.
  // The two ranges are learning steps, not official Kanken grade assignments.
  const WORDS = [
    ["一期一会", "いちごいちえ", "一度きりかもしれない出会いを大切にすること。", "同じ人と会えても、今日とまったく同じ時間は二度と来ない。", "旅行先の出会いを一期一会と思い、大切にした。", "relationship"],
    ["一石二鳥", "いっせきにちょう", "ひとつの行動で、ふたつのよい結果を得ること。", "石をひとつ投げて、鳥を二羽捕まえるイメージ。", "歩いて買い物に行けば、運動もできて一石二鳥だ。", "result"],
    ["一喜一憂", "いっきいちゆう", "状況の変化に、そのつど喜んだり心配したりすること。", "喜ぶ、憂える。そのふたつの気持ちが交互に来る。", "練習問題の点数に一喜一憂している。", "emotion"],
    ["十人十色", "じゅうにんといろ", "考え方や好みが、人によってそれぞれ違うこと。", "十人集まれば、十種類の色がある。", "好きな映画は十人十色だ。", "relationship"],
    ["以心伝心", "いしんでんしん", "言葉で説明しなくても、互いの気持ちが伝わること。", "心から心へ、言葉を使わず伝える。", "長く一緒にいる二人は、以心伝心で動ける。", "relationship"],
    ["自業自得", "じごうじとく", "自分がした行いの結果を、自分で受けること。", "自分の行いが、自分に返ってくる。", "準備を後回しにして慌てるのは自業自得だ。", "result"],
    ["試行錯誤", "しこうさくご", "試しては失敗や修正を繰り返し、よい方法を探すこと。", "試す、間違う、直す。この流れを繰り返す。", "覚えやすい勉強法を試行錯誤している。", "action"],
    ["温故知新", "おんこちしん", "昔のことを学び直し、そこから新しい知識や考えを得ること。", "古い知識を温め直すと、新しい発見につながる。", "昔の作品を読み返すと、温故知新の発見があった。", "learning"],
    ["臨機応変", "りんきおうへん", "その場の状況に合わせ、適切に対応を変えること。", "機会や変化に応じて、やり方を変える。", "予定が変わっても臨機応変に対応した。", "judgement"],
    ["切磋琢磨", "せっさたくま", "仲間と励まし合い、競い合って力を磨くこと。", "切る、削る、磨く。互いに磨き合う姿を想像する。", "友人と切磋琢磨しながら試験に備える。", "learning"],
    ["暗中模索", "あんちゅうもさく", "手がかりが少ない中で、方法や答えを探し求めること。", "暗い部屋で、出口を手探りしているイメージ。", "手本がなく、暗中模索で作業を進めた。", "uncertainty"],
    ["五里霧中", "ごりむちゅう", "状況がつかめず、どう進めばよいか判断できないこと。", "広い霧の中にいて、行き先が見えない。", "説明を聞いても全体像が見えず、五里霧中だった。", "uncertainty"],
    ["四面楚歌", "しめんそか", "周囲に味方がおらず、孤立してしまうこと。", "四方すべてから敵側の歌が聞こえ、味方がいないと感じる。", "提案に賛成する人が現れず、四面楚歌になった。", "danger"],
    ["危機一髪", "ききいっぱつ", "ほんのわずかな差で、大変な事態になりそうなこと。", "髪の毛一本ほどの差で危険が迫る。最後は「発」ではなく「髪」。", "危機一髪のところで、落ちそうな荷物をつかんだ。", "danger"],
    ["絶体絶命", "ぜったいぜつめい", "逃げ道や助かる方法がなく、追い詰められていること。", "「絶対」ではなく「絶体」。体も命も追い詰められた姿で覚える。", "逃げ道がふさがれ、主人公は絶体絶命になった。", "danger"],
    ["因果応報", "いんがおうほう", "よい行いにも悪い行いにも、それに応じた結果が返ること。", "行いが原因となり、それに応じた結果が返ってくる。", "因果応報という言葉を思い、日々の行動を振り返った。", "result"],
    ["起死回生", "きしかいせい", "だめになりかけた状態を、立ち直らせること。", "死にそうな状態から、生き返るほどの立て直し。", "最後の一打が、起死回生の逆転につながった。", "result"],
    ["右往左往", "うおうさおう", "どうしてよいか分からず、あちこち動き回ること。", "右へ行き、左へ行き、行き先が決まらない。", "初めての駅で、改札を探して右往左往した。", "uncertainty"],
    ["一心不乱", "いっしんふらん", "ほかのことに気を取られず、ひとつのことに集中すること。", "心はひとつ。ほかのことに乱されない。", "一心不乱に模型を組み立てた。", "focus"],
    ["無我夢中", "むがむちゅう", "自分のことも忘れるほど、何かに夢中になること。", "自分を意識する余裕もなく、目の前のことに没頭する。", "無我夢中で走り、気づけばゴールしていた。", "focus"],
    ["一長一短", "いっちょういったん", "よいところと、よくないところの両方があること。", "長所もあれば、短所もある。", "どちらの教材にも一長一短がある。", "judgement"],
    ["本末転倒", "ほんまつてんとう", "大事なことと、付け足しのことの順序が逆になること。", "本体と末端がひっくり返っている。", "ノートを飾るために勉強時間が減るのは本末転倒だ。", "judgement"],
    ["優柔不断", "ゆうじゅうふだん", "迷ってばかりで、なかなか決断できないこと。", "考えが揺れて、決断できない。最後は「不段」ではなく「不断」。", "優柔不断で、メニューを決めるのに時間がかかった。", "judgement"],
    ["有言実行", "ゆうげんじっこう", "口にしたことを、実際の行動に移すこと。", "言うだけで終わらず、実行する。", "毎日練習すると宣言し、有言実行で続けた。", "action"],
    ["大器晩成", "たいきばんせい", "大きな才能を持つ人が、遅い時期に力を発揮すること。", "大きな器は、完成までに時間がかかる。", "若いころに目立たなくても、大器晩成の人もいる。", "ability"],
    ["猪突猛進", "ちょとつもうしん", "周りをあまり考えず、目標に向かって激しく突き進むこと。", "イノシシがまっすぐ突進する姿。", "猪突猛進にならず、一度計画を見直そう。", "action"],
    ["馬耳東風", "ばじとうふう", "人の意見や忠告に耳を貸さず、聞き流すこと。", "馬の耳を風が通り過ぎるように、言葉を聞き流す。", "何度注意しても、本人には馬耳東風だった。", "relationship"],
    ["呉越同舟", "ごえつどうしゅう", "仲の悪い者同士が、同じ場所や目的のために一緒になること。", "争っていた呉と越の人が、同じ舟に乗る。", "競い合う二人が、呉越同舟で企画に取り組んだ。", "relationship"],
    ["臥薪嘗胆", "がしんしょうたん", "目的を果たすため、つらさに耐えて努力すること。", "薪の上で寝て、苦い胆をなめ、悔しさを忘れず耐える。", "臥薪嘗胆の日々を経て、再び勝負に挑んだ。", "effort"],
    ["疑心暗鬼", "ぎしんあんき", "疑いの気持ちから、何でもないことまで不安に思うこと。", "疑う心が強いと、暗い場所にいない鬼まで見える。", "返事が遅いだけなのに、疑心暗鬼になってしまった。", "emotion"],
    ["電光石火", "でんこうせっか", "動きや出来事が、非常に素早いこと。", "稲妻の光と、石を打った火花。どちらも一瞬。", "電光石火の動きで、ボールを奪った。", "speed"],
    ["羊頭狗肉", "ようとうくにく", "見せかけは立派でも、実際の中身がそれに見合わないこと。", "羊の頭を看板に出しながら、売るのは犬の肉。", "宣伝と中身が違いすぎて、羊頭狗肉と言われた。", "appearance"],
    ["針小棒大", "しんしょうぼうだい", "小さなことを、実際よりずっと大きく言うこと。", "針ほどの小さなものを、棒ほど大きいと説明する。", "出来事を針小棒大に伝えないよう注意した。", "appearance"],
    ["前代未聞", "ぜんだいみもん", "これまでに聞いたこともない、珍しい出来事であること。", "前の時代にも、聞いたことがない。", "前代未聞の記録に、会場が驚いた。", "novelty"],
    ["付和雷同", "ふわらいどう", "自分の考えを持たず、他人の意見にすぐ同調すること。", "周りの声につられて、そのまま同じ意見を言う。", "付和雷同せず、自分でも理由を確かめたい。", "judgement"],
    ["異口同音", "いくどうおん", "多くの人が、そろって同じことを言うこと。", "口はそれぞれ違っても、出る言葉は同じ。", "参加者は異口同音に、楽しかったと話した。", "relationship"],
    ["七転八起", "しちてんはっき", "何度失敗しても、そのたびに立ち上がること。", "七回転んでも、八回起き上がる。「起」は立ち上がる字。", "七転八起の気持ちで、もう一度挑戦した。", "effort"],
    ["七転八倒", "しちてんばっとう", "激しい苦しみで、転げ回るような状態になること。", "何度も転んで倒れる。「起」と違い、最後まで立ち上がらない。", "ひどい痛みに七転八倒した。", "suffering"],
    ["厚顔無恥", "こうがんむち", "ずうずうしく、恥ずかしい行いをしても気にしないこと。", "顔の皮が厚いように、恥を感じない。", "厚顔無恥な振る舞いに、周囲があきれた。", "attitude"],
    ["傍若無人", "ぼうじゃくぶじん", "周りの人を気にせず、勝手に振る舞うこと。", "そばに誰もいないかのように、好き勝手に動く。", "公共の場所で傍若無人に振る舞うのは困る。", "attitude"],
    ["天衣無縫", "てんいむほう", "作りものらしさがなく、自然で巧みなこと。", "天人の衣には縫い目がない。つぎはぎの跡が見えない姿。", "その文章には、天衣無縫の魅力がある。", "ability"],
    ["明鏡止水", "めいきょうしすい", "心が澄み、余計な迷いやわだかまりがないこと。", "くもりのない鏡と、波立たず静かな水。", "本番には明鏡止水の心で臨みたい。", "calm"],
    ["晴耕雨読", "せいこううどく", "晴れれば畑を耕し、雨の日は読書するような穏やかな暮らし。", "晴れた日は耕し、雨の日は読む。四字がそのまま予定表。", "退職後は晴耕雨読の生活を楽しんでいる。", "lifestyle"],
    ["不撓不屈", "ふとうふくつ", "困難があっても、心が折れずくじけないこと。", "たわまない、屈しない。負けない気持ちを二度重ねる。", "不撓不屈の精神で、練習を続けた。", "effort"],
    ["泰然自若", "たいぜんじじゃく", "何が起きても落ち着き、慌てずいつもどおりでいること。", "大きく構えて、普段の自分のままでいる。", "急な変更にも、先輩は泰然自若としていた。", "calm"],
    ["森羅万象", "しんらばんしょう", "この世に存在する、あらゆるものや現象。", "木々がずらりと並ぶように、すべてのものが広がっている。", "森羅万象を題材にした物語を読んだ。", "nature"],
    ["画竜点睛", "がりょうてんせい", "最後の大切な仕上げを加え、全体を完成させること。", "描いた竜の目に瞳を入れると、絵が完成する。「睛」は瞳の字。", "最後の一文が、作品の画竜点睛となった。", "completion"],
    ["換骨奪胎", "かんこつだったい", "元の作品の工夫を取り入れ、新しい作品として作り直すこと。", "骨組みや中身を組み替え、元とは違う作品にする。", "古い物語を換骨奪胎して、現代の劇に仕立てた。", "creation"],
    ["竜頭蛇尾", "りゅうとうだび", "始めは勢いがよいのに、終わりは振るわないこと。", "頭は立派な竜なのに、しっぽは小さな蛇。", "計画を竜頭蛇尾に終わらせないよう、最後まで続けたい。", "result"],
    ["捲土重来", "けんどちょうらい", "一度負けた者が、勢いを取り戻して再び挑むこと。", "土ぼこりを巻き上げるほどの勢いで、もう一度戻ってくる。", "敗戦を振り返り、捲土重来を期して練習した。", "effort"],
    ["悪戦苦闘", "あくせんくとう", "苦しい状況の中で、必死に努力すること。", "うまくいかない相手や問題と、何度も格闘する姿。", "難しい問題に悪戦苦闘した。", "effort", "basic"],
    ["意気投合", "いきとうごう", "気持ちや考えが合い、互いに親しくなること。", "二人の気持ちが、ぴったり重なる。", "映画の話で意気投合した。", "relationship", "basic"],
    ["意気消沈", "いきしょうちん", "元気をなくし、気持ちが沈んでしまうこと。", "気持ちの勢いが消えて、下へ沈む。", "失敗して意気消沈した。", "emotion", "basic"],
    ["意気揚揚", "いきようよう", "得意な気持ちで、元気いっぱいに振る舞うこと。", "気持ちが高く揚がり、自信にあふれる。「意気揚々」とも書く。", "意気揚揚と試合の結果を話した。", "emotion", "basic"],
    ["一網打尽", "いちもうだじん", "関係する者を、一度に残らず捕らえること。", "ひとつの網で、全部まとめて捕まえる。", "犯人の一団を一網打尽にした。", "action", "basic"],
    ["一刻千金", "いっこくせんきん", "わずかな時間にも、非常に大きな価値があること。", "短いひとときが、たくさんの金に値する。", "再会の時間は一刻千金だった。", "value", "basic"],
    ["一進一退", "いっしんいったい", "進んだり戻ったりして、なかなか決着しないこと。", "一歩進み、一歩下がる動きを繰り返す。", "試合は一進一退の攻防になった。", "result", "basic"],
    ["一部始終", "いちぶしじゅう", "出来事の始めから終わりまでの、すべての経過。", "一部分ではなく、始まりも終わりも全部。", "出来事の一部始終を説明した。", "whole", "basic"],
    ["一目瞭然", "いちもくりょうぜん", "ひと目見るだけで、はっきり分かること。", "一度目を向ければ、明らかになる。", "グラフを見ると違いは一目瞭然だ。", "clarity", "basic"],
    ["一心同体", "いっしんどうたい", "二人以上が、心をひとつにして強く結びつくこと。", "別々の人が、同じ体のように協力する。", "仲間と一心同体で挑んだ。", "relationship", "basic"],
    ["一致団結", "いっちだんけつ", "みんなが同じ目的に向け、ひとつにまとまること。", "意見を一致させ、ひとつの団体として結びつく。", "クラスが一致団結して準備した。", "relationship", "basic"],
    ["一挙両得", "いっきょりょうとく", "ひとつの行動で、ふたつの利益を得ること。", "一度の動きで、両方の得を手にする。", "掃除と整理ができて一挙両得だ。", "result", "basic"],
    ["一日千秋", "いちじつせんしゅう", "待ち遠しくて、一日が非常に長く感じられること。", "一日が千年ほどにも思える。「いちにちせんしゅう」とも読む。", "公開を一日千秋の思いで待つ。", "emotion", "basic"],
    ["一朝一夕", "いっちょういっせき", "ほんの短い時間や期間のこと。", "朝ひとつ、夕方ひとつほどの短さ。", "この技術は一朝一夕には身につかない。", "time", "basic"],
    ["一刀両断", "いっとうりょうだん", "物事を、きっぱりと処理したり決めたりすること。", "ひと振りの刀で、真っ二つに切り分ける。", "その案を一刀両断に退けた。", "judgement", "basic"],
    ["一触即発", "いっしょくそくはつ", "少しのきっかけで、争いや事件が起こりそうなこと。", "触れたら、すぐに火がついて爆発しそうな状態。", "会議は一触即発の雰囲気だった。", "danger", "basic"],
    ["一念発起", "いちねんほっき", "強く決意して、あることを始めること。", "ひとつの思いを固めて、行動を起こす。", "一念発起して勉強を始めた。", "action", "basic"],
    ["一騎当千", "いっきとうせん", "一人で多くの人に匹敵するほど、非常に強いこと。", "一人の騎兵が、千人を相手にできる。", "一騎当千の選手が加わった。", "ability", "basic"],
    ["一問一答", "いちもんいっとう", "ひとつの質問に、ひとつずつ答える形式。", "質問ひとつに対して、答えもひとつ。", "一問一答で用語を確認する。", "format", "basic"],
    ["一生懸命", "いっしょうけんめい", "全力を尽くして、物事に取り組むこと。", "命を懸けるほど、力いっぱい取り組む。", "一生懸命に練習した。", "effort", "basic"],
    ["安全第一", "あんぜんだいいち", "何よりも安全を優先すること。", "第一位に置くのは、安全を守ること。", "作業は安全第一で進めよう。", "danger", "basic"],
    ["公明正大", "こうめいせいだい", "隠し事や私心がなく、公平で正しいこと。", "誰に対しても、明るく開かれた公平さ。", "公明正大に審査してほしい。", "fairness", "basic"],
    ["正正堂堂", "せいせいどうどう", "卑怯な方法を使わず、正面から立派に行うこと。", "正しく、堂々と。「正々堂々」とも書く。", "正正堂堂と勝負した。", "fairness", "basic"],
    ["自由自在", "じゆうじざい", "思いのままに、制限なく動かせること。", "自由に、自分の思うとおりに扱う。", "道具を自由自在に使いこなす。", "ability", "basic"],
    ["縦横無尽", "じゅうおうむじん", "思いのままに、広い範囲で十分に活躍すること。", "縦にも横にも、動き回る範囲が尽きない。", "選手が縦横無尽に走り回った。", "ability", "basic"],
    ["自暴自棄", "じぼうじき", "自分を大切にする気持ちを失い、投げやりになること。", "自分に乱暴になり、自分を見捨てるような気持ち。", "失敗しても自暴自棄にならないでいたい。", "emotion", "basic"],
    ["自給自足", "じきゅうじそく", "必要なものを自分で作り、自分の生活をまかなうこと。", "自分で供給し、自分の分を足りるようにする。", "野菜を育てて自給自足を目指す。", "lifestyle", "basic"],
    ["自画自賛", "じがじさん", "自分のしたことを、自分でほめること。", "自分で描いた絵を、自分でほめる。", "出来栄えを自画自賛した。", "attitude", "basic"],
    ["自問自答", "じもんじとう", "自分で問いかけ、自分で答えて考えること。", "質問するのも、答えるのも自分。", "なぜ失敗したのか自問自答した。", "learning", "basic"],
    ["喜怒哀楽", "きどあいらく", "喜び・怒り・悲しみ・楽しみという、人のさまざまな感情。", "喜ぶ、怒る、哀しむ、楽しむ。四つの気持ち。", "喜怒哀楽の豊かな人物だ。", "emotion", "basic"],
    ["興味津津", "きょうみしんしん", "とても興味を持ち、関心が尽きないこと。", "興味が、あとからあとから湧く。「興味津々」とも書く。", "新しい仕組みに興味津津だ。", "emotion", "basic"],
    ["半信半疑", "はんしんはんぎ", "半分は信じながら、半分は疑っていること。", "信じる気持ちと疑う気持ちが、半分ずつ。", "半信半疑で説明を聞いた。", "emotion", "basic"],
    ["大胆不敵", "だいたんふてき", "度胸があり、相手を恐れず行動すること。", "大胆な心で、敵がいてもひるまない。", "大胆不敵な作戦に驚いた。", "attitude", "basic"],
    ["単刀直入", "たんとうちょくにゅう", "前置きをせず、すぐに本題へ入ること。", "一本の刀を持って、まっすぐ中へ進む。", "単刀直入に用件を伝えた。", "communication", "basic"],
    ["単純明快", "たんじゅんめいかい", "複雑さがなく、はっきりして分かりやすいこと。", "単純で、明らかに理解しやすい。", "単純明快な説明だった。", "clarity", "basic"],
    ["完全無欠", "かんぜんむけつ", "欠けたところがなく、すべてがそろっていること。", "完全で、欠点がない。", "完全無欠の計画に見えた。", "ability", "basic"],
    ["順風満帆", "じゅんぷうまんぱん", "物事が、都合よく順調に進むこと。", "追い風を帆いっぱいに受けて、船が進む。", "順風満帆なスタートを切った。", "result", "basic"],
    ["平穏無事", "へいおんぶじ", "落ち着いていて、問題や事件が起きないこと。", "穏やかで、特別な問題がない。", "平穏無事な一日だった。", "calm", "basic"],
    ["無病息災", "むびょうそくさい", "病気にならず、健康で過ごすこと。", "病がなく、災いも起きない。", "家族の無病息災を願う。", "health", "basic"],
    ["和気藹藹", "わきあいあい", "なごやかで、楽しい雰囲気に満ちていること。", "やわらかな空気が広がる。「和気藹々」とも書く。", "和気藹藹と話し合った。", "relationship", "basic"],
    ["和洋折衷", "わようせっちゅう", "日本風と西洋風のよいところを組み合わせること。", "和の形と洋の形を、ほどよく取り混ぜる。", "和洋折衷の建物を見学した。", "creation", "basic"],
    ["古今東西", "ここんとうざい", "昔から今まで、あらゆる場所のこと。", "昔と今、東と西。時間も場所も幅広く含む。", "古今東西の物語を集めた。", "whole", "basic"],
    ["老若男女", "ろうにゃくなんにょ", "年齢や性別にかかわらない、すべての人々。", "老人も若者も、男性も女性も。", "老若男女に親しまれる作品だ。", "whole", "basic"],
    ["東奔西走", "とうほんせいそう", "用事のため、あちこち忙しく走り回ること。", "東へ奔り、西へ走る。", "準備のために東奔西走した。", "action", "basic"],
    ["南船北馬", "なんせんほくば", "各地を旅して、忙しく動き回ること。", "南では船、北では馬に乗って移動する。", "仕事で南船北馬の日々を送る。", "action", "basic"],
    ["花鳥風月", "かちょうふうげつ", "自然の美しい景色や、それを楽しむ風流な心。", "花、鳥、風、月。自然の美しさを四つ並べる。", "花鳥風月を題材に詩を書いた。", "nature", "basic"],
    ["春夏秋冬", "しゅんかしゅうとう", "春・夏・秋・冬という、一年の四つの季節。", "四字を順に読めば、季節が一周する。", "春夏秋冬の風景を写真に収めた。", "nature", "basic"],
    ["三寒四温", "さんかんしおん", "寒い日と暖かい日が、数日ずつ交互に続くこと。", "寒い三日、暖かい四日という天候の移り変わり。", "三寒四温を繰り返す時期になった。", "nature", "basic"],
    ["日進月歩", "にっしんげっぽ", "日ごと、月ごとに、絶えず進歩すること。", "毎日進み、毎月歩みを進める。", "技術は日進月歩で変わっている。", "learning", "basic"],
    ["百発百中", "ひゃっぱつひゃくちゅう", "狙ったものに、毎回確実に当たること。", "百回放って、百回当たる。", "予想が百発百中だった。", "ability", "basic"],
    ["百戦百勝", "ひゃくせんひゃくしょう", "戦うたびに、すべて勝つこと。", "百回戦い、百回勝利する。", "百戦百勝の強さを誇った。", "ability", "basic"],
    ["百戦錬磨", "ひゃくせんれんま", "多くの経験を積み、十分に鍛えられていること。", "何度も戦い、経験によって磨かれてきた。", "百戦錬磨の先輩に相談した。", "ability", "basic"],
    ["百花繚乱", "ひゃっかりょうらん", "多くの花が咲き乱れること。また、多彩な才能が活躍すること。", "いろいろな花が、いっせいに咲き広がる。", "百花繚乱の作品が並んだ。", "variety", "basic"],
    ["千差万別", "せんさばんべつ", "違いが非常に多く、さまざまであること。", "千の差と万の別。違いが数えきれない。", "勉強の進め方は千差万別だ。", "variety", "basic"],
    ["千変万化", "せんぺんばんか", "さまざまな形に、次々と変わること。", "千も万も、変化が続いていく。", "雲の形が千変万化する。", "change", "basic"],
    ["千載一遇", "せんざいいちぐう", "めったに訪れない、非常によい機会。", "千年に一度、出会えるような機会。", "千載一遇の機会を生かしたい。", "chance", "basic"],
    ["千客万来", "せんきゃくばんらい", "多くの客が、次々にやって来ること。", "千人も万人も、客が来る勢い。", "祭りの日は千客万来だった。", "prosperity", "basic"],
    ["前途洋洋", "ぜんとようよう", "将来が大きく開けていて、希望に満ちていること。", "前へ続く道が、海のように広い。「前途洋々」とも書く。", "前途洋洋な若者を応援する。", "result", "basic"],
    ["前途多難", "ぜんとたなん", "これから先に、多くの困難が待っていること。", "前に続く道に、難しいことが多い。", "再建の道は前途多難だ。", "danger", "basic"],
    ["多種多様", "たしゅたよう", "種類も姿や性質も、非常にさまざまなこと。", "種類が多く、様子もそれぞれ違う。", "多種多様な道具がそろっている。", "variety", "basic"],
    ["多事多難", "たじたなん", "事件や問題、困難なことが次々と起こること。", "出来事も多い、難しいことも多い。", "多事多難な一年を振り返った。", "suffering", "basic"],
    ["波瀾万丈", "はらんばんじょう", "大きな変化や事件が多く、起伏に富んでいること。", "高い波が次々に立つような人生の展開。", "波瀾万丈の人生を描いた映画だ。", "suffering", "basic"],
    ["不言実行", "ふげんじっこう", "あれこれ言わず、黙って行動で示すこと。", "言葉を先に出さず、実行する。", "不言実行で仕事を進める人だ。", "action", "basic"],
    ["文武両道", "ぶんぶりょうどう", "学問と武芸の両方に優れ、両立していること。", "文の学びと、武の鍛錬。二つの道を進む。", "文武両道を目標に励んだ。", "ability", "basic"],
    ["勇猛果敢", "ゆうもうかかん", "勇ましく、迷わず思い切って行動すること。", "勇気があり、決断して敢えて進む。", "勇猛果敢に挑んだ。", "attitude", "basic"],
    ["先手必勝", "せんてひっしょう", "相手より先に行動して、勝利をつかむこと。", "先に一手を打ち、勝ちにつなげる。", "先手必勝で準備を進めた。", "action", "basic"],
    ["全身全霊", "ぜんしんぜんれい", "持てる体力と精神力のすべて。", "体全体も、心全体も、全部使う。", "全身全霊を込めて演じた。", "effort", "basic"],
    ["誠心誠意", "せいしんせいい", "うそやごまかしのない、心からの真剣な気持ち。", "心にも意志にも、誠実さを込める。", "誠心誠意対応した。", "fairness", "basic"],
    ["相思相愛", "そうしそうあい", "互いに相手を思い、愛し合っていること。", "思う気持ちも愛する気持ちも、互いに向け合う。", "二人は相思相愛だった。", "relationship", "basic"],
    ["弱肉強食", "じゃくにくきょうしょく", "弱い者が強い者の犠牲になること。", "弱い動物の肉を、強い動物が食べる姿。", "弱肉強食の世界を描く。", "danger", "basic"],
    ["適材適所", "てきざいてきしょ", "その人の能力に合った役割や場所に配置すること。", "合う人材を、合う場所へ置く。", "適材適所で役割を分けた。", "judgement", "basic"],
    ["二人三脚", "ににんさんきゃく", "二人が歩調を合わせ、協力して物事を進めること。", "二人の片足を結び、三本の足で一緒に進む。", "友人と二人三脚で準備した。", "relationship", "basic"],
    ["二束三文", "にそくさんもん", "数が多くても、値段が非常に安いこと。", "二束まとめても、わずかな代金にしかならない。", "古い品を二束三文で売った。", "value", "basic"],
    ["無理難題", "むりなんだい", "実現するのが難しい、無茶な要求や課題。", "無理な条件と、難しい問題が重なる。", "無理難題を押しつけられた。", "danger", "basic"],
    ["有名無実", "ゆうめいむじつ", "名前や形だけがあり、実際の中身が伴わないこと。", "名前は有るが、実体は無い。", "制度が有名無実になっている。", "appearance", "basic"],
    ["阿鼻叫喚", "あびきょうかん", "ひどく悲惨で、多くの人が泣き叫ぶような状態。", "地獄の苦しみを表す言葉から、悲惨な場面を連想する。", "物語では阿鼻叫喚の場面が続いた。", "suffering", "step"],
    ["栄枯盛衰", "えいこせいすい", "栄えたり衰えたりする、世の中や人生の変化。", "栄える、枯れる、盛んになる、衰える。上下する流れ。", "王朝の栄枯盛衰を学んだ。", "change", "step"],
    ["隔靴掻痒", "かっかそうよう", "思いどおりに届かず、もどかしく感じること。", "靴の上からかゆい足を掻いても、かゆい所に届かない。", "遠回しな説明に隔靴掻痒の思いがした。", "emotion", "step"],
    ["乾坤一擲", "けんこんいってき", "運命を懸けて、大きな勝負をすること。", "天地ほど大きなものを懸け、さいころを一度投げる。", "乾坤一擲の勝負に挑む。", "action", "step"],
    ["雲散霧消", "うんさんむしょう", "雲や霧が消えるように、すっかりなくなること。", "雲は散り、霧は消えて、何も残らなくなる。", "不安が雲散霧消した。", "change", "step"],
    ["雲外蒼天", "うんがいそうてん", "困難の先には、希望のある世界が開けるということ。", "雲を抜けた外には、青空が広がる。", "雲外蒼天を信じて努力する。", "effort", "step"],
    ["臥竜鳳雛", "がりょうほうすう", "まだ世に知られていない、将来有望な優れた人。", "眠る竜と、鳳凰のひな。大きな力がまだ隠れている。", "臥竜鳳雛の若者が集まった。", "ability", "step"],
    ["快刀乱麻", "かいとうらんま", "複雑な問題を、鮮やかに解決すること。", "よく切れる刀で、絡んだ麻を一気に切る。", "難しい交渉を快刀乱麻の勢いで解決した。", "judgement", "step"],
    ["我田引水", "がでんいんすい", "自分に都合のよいように、話や物事を運ぶこと。", "自分の田んぼだけに、水を引き込む。", "我田引水の説明では納得されない。", "attitude", "step"],
    ["画蛇添足", "がだてんそく", "余計なことを付け加え、かえって悪くしてしまうこと。", "描いた蛇に、いらない足を付け足してしまう。", "説明を増やしすぎると画蛇添足になりかねない。", "judgement", "step"],
    ["感慨無量", "かんがいむりょう", "深く心を動かされ、その思いが尽きないこと。", "感じる思いが大きく、量れないほどになる。", "完成した姿を見て感慨無量だった。", "emotion", "step"],
    ["勧善懲悪", "かんぜんちょうあく", "よい行いを勧め、悪い行いをこらしめること。", "善を勧め、悪を懲らしめる。前後二字ずつで考える。", "勧善懲悪の物語を読んだ。", "fairness", "step"],
    ["完全燃焼", "かんぜんねんしょう", "持てる力をすべて出し切ること。", "燃料を残さず燃やすように、自分の力を使い切る。", "大会で完全燃焼できた。", "effort", "step"],
    ["疑問氷解", "ぎもんひょうかい", "疑問がすっかり解けて、理解できること。", "疑問のかたまりが、氷のように解ける。", "説明を聞いて疑問氷解した。", "learning", "step"],
    ["空前絶後", "くうぜんぜつご", "過去に例がなく、これからもないと思えるほど珍しいこと。", "前にもなく、後にもない。前後を両方否定する。", "空前絶後の規模で開催された。", "novelty", "step"],
    ["群雄割拠", "ぐんゆうかっきょ", "多くの実力者が、それぞれ勢力を持って競い合うこと。", "強い者たちが、地域や分野を分けて並び立つ。", "業界は群雄割拠の時代に入った。", "competition", "step"],
    ["鶏口牛後", "けいこうぎゅうご", "大きな集団の末端より、小さな集団の先頭に立つ方がよいこと。", "小さな鶏の口と、大きな牛の後ろを比べる。", "鶏口牛後を選び、小さな店を率いた。", "judgement", "step"],
    ["鶏鳴狗盗", "けいめいくとう", "人をだます小さな技や、こそ泥のような者のたとえ。ささいな特技が役立つ意でも使う。", "鶏の鳴きまねと、犬のような盗みが危機を救った故事。", "鶏鳴狗盗の故事から、特技の価値を考えた。", "ability", "step"],
    ["月下氷人", "げっかひょうじん", "男女の結婚を取り持つ人、仲人のこと。", "月の下の老人と、氷の上の人にまつわる二つの故事。", "二人の月下氷人を務めた。", "relationship", "step"],
    ["言行一致", "げんこういっち", "言っていることと、実際の行動が合っていること。", "言葉と行動を、一致させる。", "言行一致を心がけたい。", "action", "step"],
    ["堅忍不抜", "けんにんふばつ", "つらいことに耐え、強い意志を変えないこと。", "固く耐え、心の根が抜けないように踏ん張る。", "堅忍不抜の精神で続けた。", "effort", "step"],
    ["牽強付会", "けんきょうふかい", "筋の通らないことを、無理にこじつけること。", "強く引っ張って、合わない話をくっつける。", "その解釈は牽強付会に思える。", "judgement", "step"],
    ["行雲流水", "こううんりゅうすい", "物事にとらわれず、自然の流れに任せて行動すること。", "流れていく雲と水のように、形に縛られない。", "行雲流水の暮らしに憧れる。", "lifestyle", "step"],
    ["孤軍奮闘", "こぐんふんとう", "助けがない中で、一人で懸命に頑張ること。", "孤立した軍が、全力で戦う。", "一人で孤軍奮闘していた。", "effort", "step"],
    ["孤立無援", "こりつむえん", "仲間や助けがなく、孤立していること。", "孤立していて、援助も無い。", "孤立無援の状況を抜け出した。", "danger", "step"],
    ["古色蒼然", "こしょくそうぜん", "長い年月を感じさせる、古びた趣があること。", "古い色合いが、全体に表れている。", "古色蒼然とした建物を訪ねた。", "appearance", "step"],
    ["豪放磊落", "ごうほうらいらく", "心が大きく、細かなことを気にしないこと。", "大らかに構えて、小さなわだかまりを残さない。", "豪放磊落な人柄にひかれた。", "attitude", "step"],
    ["五風十雨", "ごふうじゅうう", "風や雨がほどよく巡り、農業に適した天候になること。", "五日ごとに風、十日ごとに雨という、恵まれた巡り。", "五風十雨の年となり、作物が育った。", "nature", "step"],
    ["呉下阿蒙", "ごかのあもう", "学問や知識が身につかず、昔のまま進歩していない人。", "呉にいたころの無学な呂蒙を指す故事。「もはや呉下阿蒙ではない」と成長をほめる。", "勉強を続け、もはや呉下阿蒙ではないと言われた。", "learning", "step"],
    ["三位一体", "さんみいったい", "三つのものが、ひとつにまとまって働くこと。", "三つの立場が、一つの体のように結びつく。", "三者が三位一体となって取り組む。", "relationship", "step"],
    ["三者三様", "さんしゃさんよう", "三人それぞれの考え方や姿が違うこと。", "三者がいれば、三つの様子がある。", "答えは三者三様だった。", "variety", "step"],
    ["三拝九拝", "さんぱいきゅうはい", "何度も頭を下げ、丁寧にお願いすること。", "三回も九回も拝むほど、繰り返して頼む。", "三拝九拝して協力をお願いした。", "communication", "step"],
    ["自縄自縛", "じじょうじばく", "自分の言葉や行動が原因で、自分の自由を失うこと。", "自分で用意した縄で、自分を縛る。", "無理な約束で自縄自縛になった。", "result", "step"],
    ["四苦八苦", "しくはっく", "非常に苦労して、つらい思いをすること。", "四つも八つも、苦しいことが重なる。", "準備に四苦八苦した。", "suffering", "step"],
    ["質実剛健", "しつじつごうけん", "飾り気がなく誠実で、心身が強くしっかりしていること。", "質素で実直、強く健やかな姿。", "質実剛健な校風で知られる。", "attitude", "step"],
    ["疾風迅雷", "しっぷうじんらい", "動きや行動が、非常に速く激しいこと。", "強い風と、激しい雷の勢い。", "疾風迅雷の攻撃を見せた。", "speed", "step"],
    ["遮二無二", "しゃにむに", "後先を考えず、ひとつのことへ強引に突き進むこと。", "別のことに目を向けず、目の前へまっすぐ進む姿。", "遮二無二走り続けた。", "action", "step"],
    ["周章狼狽", "しゅうしょうろうばい", "非常に慌て、どうしてよいか分からなくなること。", "慌てる意味を二度重ねた、落ち着かない状態。", "突然の知らせに周章狼狽した。", "uncertainty", "step"],
    ["主客転倒", "しゅかくてんとう", "主となるものと、従となるものの立場が逆になること。", "主人と客の役割が、ひっくり返る。", "道具のために目的を変えるのは主客転倒だ。", "judgement", "step"],
    ["首尾一貫", "しゅびいっかん", "始めから終わりまで、考えや態度が変わらないこと。", "頭から尻尾まで、一本の線が通っている。", "説明は首尾一貫していた。", "consistency", "step"],
    ["取捨選択", "しゅしゃせんたく", "必要なものを選び、不要なものを捨てること。", "取るか捨てるかを決めて、選び分ける。", "情報を取捨選択する。", "judgement", "step"],
    ["春風駘蕩", "しゅんぷうたいとう", "春風が穏やかに吹く様子。また、人柄がのんびり穏やかなこと。", "やわらかな春の風に包まれている姿。", "春風駘蕩とした雰囲気の人だ。", "calm", "step"],
    ["諸行無常", "しょぎょうむじょう", "すべての物事は変わり続け、同じ状態ではとどまらないこと。", "いろいろな物事に、永遠に変わらないものはない。", "時代の変化に諸行無常を感じた。", "change", "step"],
    ["支離滅裂", "しりめつれつ", "話や考えがばらばらで、筋が通っていないこと。", "離れ離れになり、つながりが切れてしまう。", "説明が支離滅裂になった。", "clarity", "step"],
    ["深謀遠慮", "しんぼうえんりょ", "先のことまで見通し、深く考えて計画すること。", "深く策を練り、遠い将来まで考える。", "深謀遠慮に基づく計画だった。", "judgement", "step"],
    ["人心一新", "じんしんいっしん", "人々の気持ちを、新しく切り替えること。", "みんなの心を、一度新しくする。", "組織を変えて人心一新を図る。", "change", "step"],
    ["心機一転", "しんきいってん", "あるきっかけで、気持ちを新しく切り替えること。", "心の動きを、くるりと転じてやり直す。", "心機一転、新しい目標を立てた。", "change", "step"],
    ["清廉潔白", "せいれんけっぱく", "私欲や不正がなく、心や行いが清らかなこと。", "清く、欲に流されず、汚れのない姿。", "清廉潔白な人物として知られる。", "fairness", "step"],
    ["切歯扼腕", "せっしやくわん", "非常に悔しがり、怒りを感じること。", "歯を食いしばり、自分の腕を強く握るほど悔しい。", "敗北に切歯扼腕した。", "emotion", "step"],
    ["千慮一失", "せんりょいっしつ", "十分に考える賢い人でも、ときには失敗すること。", "千回考えても、一回の見落としは起こる。", "今回の見落としは千慮一失だった。", "judgement", "step"],
    ["千慮一得", "せんりょいっとく", "愚かな者でも、たまにはよい考えに行き着くこと。", "千回考えた中に、一つよい考えがある。", "私の提案も千慮一得になればうれしい。", "judgement", "step"],
    ["大同小異", "だいどうしょうい", "小さな違いはあるが、大体は同じであること。", "大きな部分は同じ、小さな部分だけ異なる。", "二つの案は大同小異だ。", "comparison", "step"],
    ["朝三暮四", "ちょうさんぼし", "目先の違いにとらわれ、全体が同じことに気づかないこと。", "朝三つと夕四つを、朝四つと夕三つに変えても合計は同じ。", "条件の見せ方を変えただけで朝三暮四だ。", "judgement", "step"],
    ["朝令暮改", "ちょうれいぼかい", "方針や命令が、短い間に何度も変わること。", "朝出した命令を、夕方には改める。", "朝令暮改では現場が困る。", "change", "step"],
    ["天真爛漫", "てんしんらんまん", "飾らず自然で、明るく無邪気なこと。", "生まれながらの素直さが、明るくあふれる。", "天真爛漫な笑顔を見せた。", "attitude", "step"],
    ["同工異曲", "どうこういきょく", "見た目や方法は違っても、中身や出来栄えが似ていること。", "曲は異なっていても、作りの巧みさは同じ。", "二つの作品には同工異曲の工夫がある。", "comparison", "step"],
    ["同床異夢", "どうしょういむ", "同じ立場で一緒にいても、考えや目的が違うこと。", "同じ寝床にいても、見る夢は別々。", "協力していても、実は同床異夢だった。", "relationship", "step"],
    ["独立独歩", "どくりつどっぽ", "他人に頼らず、自分の力で進んでいくこと。", "自分で立ち、自分で歩く。", "独立独歩の道を選んだ。", "lifestyle", "step"],
    ["内憂外患", "ないゆうがいかん", "内側にも外側にも、心配や困難を抱えていること。", "内には憂い、外には災いがある。", "内憂外患の状況に対応する。", "danger", "step"],
    ["南柯之夢", "なんかのゆめ", "はかない夢や、現実には長く続かない栄華のこと。", "大きな成功も、目覚めれば短い夢だったという故事。", "かつての栄華は南柯之夢のようだった。", "change", "step"],
    ["博学多才", "はくがくたさい", "広い知識を持ち、多くの才能にも恵まれていること。", "学びが広く、才能が多い。", "博学多才な先生に教わった。", "ability", "step"],
    ["美辞麗句", "びじれいく", "見た目は美しいが、実質に乏しい言葉。", "美しい言葉を並べても、中身があるとは限らない。", "美辞麗句より具体的な説明がほしい。", "appearance", "step"],
    ["不易流行", "ふえきりゅうこう", "変わらない本質を大切にしながら、新しい変化も取り入れること。", "不変のものと、時代とともに流れるものを両立する。", "不易流行を意識して伝統を受け継ぐ。", "change", "step"],
    ["不即不離", "ふそくふり", "近づきすぎず、離れすぎない関係を保つこと。", "ぴったり付かず、遠く離れもしない。", "不即不離の関係を続ける。", "relationship", "step"],
    ["粉骨砕身", "ふんこつさいしん", "力を惜しまず、懸命に努力すること。", "骨や体が砕けるほど、全力を尽くすたとえ。", "粉骨砕身して役目を果たした。", "effort", "step"],
    ["岡目八目", "おかめはちもく", "当事者よりも、外から見る人の方がよく状況を判断できること。", "囲碁を横で見る人は、打つ本人より先まで見通せる。", "岡目八目で、見落としを教えてもらった。", "judgement", "step"],
    ["無為徒食", "むいとしょく", "何も仕事をせず、ただ食べて暮らすこと。", "何も為さず、ただ食べるだけの生活。", "無為徒食の日々から抜け出したい。", "lifestyle", "step"],
    ["唯我独尊", "ゆいがどくそん", "自分だけが特別に優れていると、思い上がること。", "日常では自分だけを尊いと思う態度を指す。仏教由来の意味もある。", "唯我独尊の態度を改めたい。", "attitude", "step"],
    ["用意周到", "よういしゅうとう", "細かなところまで気を配り、十分に準備していること。", "用意が、隅々まで行き届いている。", "用意周到な計画だった。", "judgement", "step"],
    ["利害得失", "りがいとくしつ", "利益と損害、得るものと失うもの。", "利か害か、得か失か。両面を並べる。", "利害得失を比べて判断した。", "comparison", "step"],
    ["理路整然", "りろせいぜん", "考えや説明の筋道が、きちんと整っていること。", "理屈の道が、順序よく並んでいる。", "理路整然と説明した。", "clarity", "step"],
    ["連帯責任", "れんたいせきにん", "一人の行動などについて、関係者が一緒に責任を負うこと。", "つながった仲間が、責任を共有する。", "全員で連帯責任を負うことになった。", "relationship", "step"],
    ["論功行賞", "ろんこうこうしょう", "功績を調べ、その働きに応じて褒美を与えること。", "功績を論じて、賞を行う。", "公平な論功行賞が求められる。", "fairness", "step"],
    ["和魂洋才", "わこんようさい", "日本の精神を大切にし、西洋の知識や技術を取り入れること。", "心は和、学問や技術は洋という組み合わせ。", "和魂洋才の考え方を学んだ。", "creation", "step"],
    ["八面六臂", "はちめんろっぴ", "一人で何人もの役割をこなすように、幅広く活躍すること。", "八つの顔と六本の腕があるような働きぶり。", "先輩が八面六臂の活躍をした。", "ability", "step"]
  ].map((entry, index) => Object.freeze({
    id: "yoji-" + String(index + 1).padStart(2, "0"),
    word: entry[0], reading: entry[1], meaning: entry[2], hint: entry[3], example: entry[4], group: entry[5],
    range: entry[6] || (index < 25 ? "basic" : "step")
  }));

  // Do not offer another accepted spelling as an incorrect fill-in answer.
  const WRITING_VARIANTS = Object.freeze({
    "暗中模索": ["暗中摸索"],
    "捲土重来": ["巻土重来"],
    "竜頭蛇尾": ["龍頭蛇尾"],
    "画竜点睛": ["画龍点睛"],
    "臥竜鳳雛": ["臥龍鳳雛"],
    "意気揚揚": ["意気揚々"],
    "正正堂堂": ["正々堂々"],
    "興味津津": ["興味津々"],
    "和気藹藹": ["和気藹々"],
    "前途洋洋": ["前途洋々"],
    "百戦錬磨": ["百戦練磨"],
    "波瀾万丈": ["波乱万丈"],
    "和洋折衷": ["和洋折中"],
    "岡目八目": ["傍目八目"],
    "隔靴掻痒": ["隔靴搔痒", "隔靴掻癢", "隔靴搔癢"]
  });

  const IDS = new Set(WORDS.map(word => word.id));
  const MODES = ["meaning", "reading", "writing"];
  const STORAGE_KEY = "qualification-route-yoji-v1";

  function shuffle(items, random = Math.random) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.min(i, Math.max(0, Math.floor(random() * (i + 1))));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function sanitizeRecords(value) {
    const clean = {};
    if (!value || typeof value !== "object" || Array.isArray(value)) return clean;
    for (const word of WORDS) {
      const item = value[word.id];
      if (!item || typeof item !== "object" || Array.isArray(item)) continue;
      const skills = {};
      for (const mode of MODES) {
        const skill = item.skills && item.skills[mode];
        if (!skill || typeof skill !== "object") continue;
        skills[mode] = {
          review: skill.review === true,
          streak: Number.isInteger(skill.streak) ? Math.max(0, Math.min(2, skill.streak)) : 0
        };
      }
      clean[word.id] = { learned: item.learned === true, skills };
    }
    return clean;
  }

  function needsReview(record, mode) {
    if (!record || !record.skills) return false;
    if (MODES.includes(mode)) return record.skills[mode]?.review === true;
    return MODES.some(skill => record.skills[skill]?.review === true);
  }

  function applyAnswer(records, id, mode, correct) {
    if (!IDS.has(id) || !MODES.includes(mode)) return records;
    const previous = records[id] || { learned: false, skills: {} };
    const previousSkill = previous.skills[mode] || { review: false, streak: 0 };
    const streak = correct ? Math.min(2, previousSkill.streak + 1) : 0;
    const skill = { review: correct ? previousSkill.review && streak < 2 : true, streak };
    return { ...records, [id]: { ...previous, skills: { ...previous.skills, [mode]: skill } } };
  }

  function makeQueue(range, size, records = {}, review = false, mode = "learn", random = Math.random) {
    let candidates = WORDS.filter(word => range === "all" || word.range === range);
    if (review) candidates = candidates.filter(word => needsReview(records[word.id], mode));
    const limit = [3, 5, 10].includes(Number(size)) ? Number(size) : 5;
    return shuffle(candidates, random).slice(0, limit);
  }

  function makeQuestion(word, mode, random = Math.random) {
    let correct, options, display = word.word;
    if (mode === "writing") {
      const position = Math.min(3, Math.max(0, Math.floor(random() * 4)));
      const chars = [...word.word];
      correct = chars[position];
      chars[position] = "□";
      display = chars.join("");
      const variants = WRITING_VARIANTS[word.word] || [];
      const wrong = [...new Set(WORDS.flatMap(item => [...item.word]))]
        .filter(char => char !== correct && !variants.includes(display.replace("□", char)));
      options = [correct, ...shuffle(wrong, random).slice(0, 3)];
    } else {
      const field = mode === "meaning" ? "meaning" : "reading";
      correct = word[field];
      // Exclude related meanings so synonymous explanations never compete.
      const candidates = WORDS.filter(item => item.id !== word.id && (mode !== "meaning" || item.group !== word.group));
      options = [correct, ...shuffle(candidates, random).slice(0, 3).map(item => item[field])];
    }
    options = shuffle(options, random);
    return { display, options, answer: options.indexOf(correct) };
  }

  const core = Object.freeze({ WORDS, STORAGE_KEY, shuffle, sanitizeRecords, needsReview, applyAnswer, makeQueue, makeQuestion });
  if (typeof module !== "undefined" && module.exports) module.exports = core;
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const $ = id => document.getElementById(id);
  const elements = {};
  ["setupPanel", "studyPanel", "summaryPanel", "wordRange", "sessionSize", "learnedCount", "reviewCount", "storageNote", "setupStatus", "sessionLabel", "questionCount", "sessionCorrect", "studyProgress", "questionTitle", "questionWord", "questionPrompt", "answerOptions", "learnActions", "revealCard", "unsureAnswer", "answerFeedback", "cardAnswer", "cardReading", "cardMeaning", "cardHint", "cardExample", "writingNote", "markLearned", "nextWord", "summaryTitle", "summaryScore", "summaryMessage", "summaryWords"].forEach(id => { elements[id] = $(id); });

  let records = {};
  let storageAvailable = true;
  let storedRecords = "{}";
  try { storedRecords = window.localStorage.getItem(STORAGE_KEY) || "{}"; }
  catch { storageAvailable = false; }
  try { records = sanitizeRecords(JSON.parse(storedRecords)); }
  catch { records = {}; }
  let session = null;
  let question = null;
  let resolved = false;

  function saveRecords() {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); storageAvailable = true; }
    catch { storageAvailable = false; }
    updateStats();
  }

  function updateStats() {
    elements.learnedCount.textContent = WORDS.filter(word => records[word.id]?.learned).length;
    elements.reviewCount.textContent = WORDS.filter(word => needsReview(records[word.id])).length;
    elements.storageNote.textContent = storageAvailable
      ? "記録はこのブラウザに保存します。別の端末とは共有されません。"
      : "記録を保存できないため、今開いているページの中でのみ復習できます。";
  }

  function showPanel(name) {
    for (const panel of ["setupPanel", "studyPanel", "summaryPanel"]) elements[panel].hidden = panel !== name;
  }

  function startSession(review = false) {
    const mode = document.querySelector('input[name="studyMode"]:checked').value;
    const range = elements.wordRange.value;
    const queue = makeQueue(range, elements.sessionSize.value, records, review, mode);
    if (!queue.length) {
      elements.setupStatus.textContent = "この範囲・練習形式には、苦手の記録がまだありません。範囲や形式を変えるか、ランダム練習を試してみてください。";
      return;
    }
    elements.setupStatus.textContent = "";
    session = { mode, range, review, queue, index: 0, results: [] };
    showPanel("studyPanel");
    renderWord();
    document.getElementById("practice").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function currentWord() { return session.queue[session.index]; }

  function renderWord() {
    resolved = false;
    const word = currentWord();
    const mode = session.mode;
    question = mode === "learn" ? null : makeQuestion(word, mode);
    const modeNames = { learn: "覚える時間", meaning: "意味の練習", reading: "読みの練習", writing: "漢字の穴埋め" };
    elements.sessionLabel.textContent = (session.review ? "苦手を復習 / " : "") + modeNames[mode];
    elements.questionCount.textContent = (session.index + 1) + " / " + session.queue.length + "語";
    elements.sessionCorrect.textContent = mode === "learn" ? "" : session.results.filter(item => item.correct).length + "問正解";
    elements.studyProgress.style.width = ((session.index + 1) / session.queue.length * 100) + "%";
    elements.questionTitle.textContent = { learn: "この言葉を、ひとつ覚えよう。", meaning: "この四字熟語の意味は？", reading: "この四字熟語、どう読む？", writing: "□に入る漢字は？" }[mode];
    elements.questionWord.textContent = question ? question.display : word.word;
    elements.questionPrompt.textContent = mode === "learn" ? "まずは読みと意味を見るところから。" : mode === "writing" ? "読み：" + word.reading : "もっとも合う答えを選んでください。";
    elements.answerOptions.replaceChildren();
    elements.answerOptions.classList.toggle("is-writing", mode === "writing");
    elements.learnActions.hidden = mode !== "learn";
    elements.unsureAnswer.hidden = mode === "learn";
    elements.answerFeedback.hidden = true;
    elements.answerFeedback.classList.remove("is-wrong");
    elements.cardAnswer.hidden = true;
    elements.nextWord.hidden = true;
    elements.markLearned.checked = records[word.id]?.learned === true;
    elements.nextWord.textContent = session.index === session.queue.length - 1 ? "今日の練習メモを見る →" : "次の言葉 →";
    if (question) question.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "yoji-answer-btn";
      const number = document.createElement("span");
      number.className = "yoji-option-number";
      number.textContent = index + 1;
      const label = document.createElement("span");
      label.textContent = option;
      button.append(number, label);
      button.addEventListener("click", () => answer(index));
      elements.answerOptions.appendChild(button);
    });
    elements.questionTitle.focus({ preventScroll: true });
  }

  function showCard() {
    const word = currentWord();
    elements.cardReading.textContent = word.word + " / " + word.reading;
    elements.cardMeaning.textContent = word.meaning;
    elements.cardHint.textContent = word.hint;
    elements.cardExample.textContent = word.example;
    elements.writingNote.textContent = "書く練習：答えを隠して、紙に「" + word.word + "」の4字を書いてみよう。";
    elements.cardAnswer.hidden = false;
    elements.learnActions.hidden = true;
    elements.nextWord.hidden = false;
  }

  function answer(index) {
    if (!session || resolved || !question) return;
    resolved = true;
    const word = currentWord();
    const correct = index === question.answer;
    records = applyAnswer(records, word.id, session.mode, correct);
    session.results.push({ word, correct });
    saveRecords();
    Array.from(elements.answerOptions.children).forEach((button, i) => {
      button.disabled = true;
      if (i === question.answer) button.classList.add("is-correct");
      if (!correct && i === index) button.classList.add("is-wrong");
    });
    elements.unsureAnswer.hidden = true;
    elements.answerFeedback.hidden = false;
    elements.answerFeedback.classList.toggle("is-wrong", !correct);
    elements.answerFeedback.textContent = correct ? "正解。この調子で、ひとつずつ。" : "答えは「" + question.options[question.answer] + "」。この言葉を苦手の復習に残しました。";
    elements.sessionCorrect.textContent = session.results.filter(item => item.correct).length + "問正解";
    showCard();
  }

  function revealCard() {
    if (!session || session.mode !== "learn" || resolved) return;
    resolved = true;
    session.results.push({ word: currentWord(), correct: null });
    showCard();
  }

  function nextWord() {
    if (!session || !resolved) return;
    session.index++;
    if (session.index < session.queue.length) renderWord();
    else showSummary();
  }

  function showSummary() {
    showPanel("summaryPanel");
    const correct = session.results.filter(item => item.correct).length;
    elements.summaryScore.textContent = session.mode === "learn" ? session.queue.length + "語に触れました" : correct + " / " + session.queue.length + "問正解";
    elements.summaryMessage.textContent = session.mode === "learn" ? "次は読みや意味の問題で、思い出せるか試してみよう。" : correct === session.queue.length ? "全部正解。明日も少し触れて、覚えた言葉を増やそう。" : "間違えた語は苦手に残っています。答えと意味を確認して、もう一度試してみよう。";
    elements.summaryWords.replaceChildren();
    session.results.forEach(item => {
      const row = document.createElement("div");
      row.className = "yoji-summary-word";
      const content = document.createElement("div");
      const title = document.createElement("b");
      title.textContent = item.word.word;
      const reading = document.createElement("small");
      reading.textContent = item.word.reading;
      content.append(title, reading);
      const status = document.createElement("span");
      status.className = "yoji-summary-state" + (item.correct === false ? " is-wrong" : "");
      status.textContent = item.correct === null ? (records[item.word.id]?.learned ? "覚えた" : "見て学んだ") : item.correct ? "正解" : "復習に残す";
      row.append(content, status);
      elements.summaryWords.appendChild(row);
    });
    elements.summaryTitle.focus({ preventScroll: true });
  }

  function showSetup() {
    showPanel("setupPanel");
    session = null;
    question = null;
    elements.setupStatus.textContent = "";
    document.getElementById("setupTitle").setAttribute("tabindex", "-1");
    document.getElementById("setupTitle").focus({ preventScroll: true });
  }

  $("startRandom").addEventListener("click", () => startSession(false));
  $("startReview").addEventListener("click", () => startSession(true));
  $("leaveSession").addEventListener("click", showSetup);
  $("summaryHome").addEventListener("click", showSetup);
  $("revealCard").addEventListener("click", revealCard);
  $("unsureAnswer").addEventListener("click", () => answer(-1));
  $("nextWord").addEventListener("click", nextWord);
  $("practiceAgain").addEventListener("click", () => startSession(false));
  elements.markLearned.addEventListener("change", () => {
    if (!session) return;
    const id = currentWord().id;
    records = { ...records, [id]: { ...(records[id] || { skills: {} }), learned: elements.markLearned.checked } };
    saveRecords();
  });
  $("resetRecords").addEventListener("click", () => {
    if (!window.confirm("覚えた印と苦手の記録をすべて消しますか？")) return;
    records = {};
    saveRecords();
    showSetup();
    elements.setupStatus.textContent = "学習記録を消しました。";
  });
  window.addEventListener("storage", event => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    try {
      records = sanitizeRecords(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}"));
      updateStats();
      if (session && session.index < session.queue.length) elements.markLearned.checked = records[currentWord().id]?.learned === true;
    } catch { /* Keep the current page's usable in-memory record. */ }
  });
  const practiceParams = new URLSearchParams(window.location.search);
  const requestedMode = practiceParams.get("mode");
  const requestedCount = practiceParams.get("count");
  if (["3", "5", "10"].includes(requestedCount)) document.getElementById("sessionSize").value = requestedCount;
  if (["learn", ...MODES].includes(requestedMode)) {
    document.querySelector('input[name="studyMode"][value="' + requestedMode + '"]').checked = true;
  }
  updateStats();
})();
