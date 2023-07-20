/*
Nightmare Scriptの書き方

1 ノーツの扱い
  Nightmare Scriptではノーツを6種類(Tap, Long, Flick, Keep2Flick, FlickInKeep, LongFlickStart)に分けています。
  1.1 Tap
    タップノーツです。判定は画面を押した瞬間になされます。
  
  1.2 Long
    ロングノーツです。タップした後、指を離さずにキープしなくてはいけません。
    開始部分の判定は画面を押した瞬間になされます。終了部分は、指を離したタイミングが早過ぎた時にGoodやBadになります。
  
  1.3 Flick
    フリックノーツです。このノーツは画面をはじくように触る必要があります。
    タップ、指を動かす、指を離す、という一連の動作を判定時間内に行う必要があります。

  1.4 Keep2Flick
    フリックノーツの内、タップ開始の判定が無い物です。
    一定以上のスピードで指を動かす、指を離す、という一連の動作を判定時間内に行う必要があります。

  1.5 FlickInKeep
    フリックノーツの内、指を離す必要が無い物です。ロングノーツ中のフリックなどがこれに当てはまります。
    指を一定以上のスピードで動かしたタイミングで判定されます。

  1.6 LongFlickStart
  　名前の通り、フリックのロングノーツの開始部分を意味します。
    これはフリック判定は無く、タップだけに判定があります。

*/

const NTYPE_TAP = 0;
const NTYPE_LONG = 1;
const NTYPE_FLICK = 2;
const NTYPE_KEEP2FLICK = 3;
const NTYPE_FLICKINKEEP = 4;
const NTYPE_LONGFLICKSTART = 5;


