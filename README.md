# NightmareStellaとは？
一言で言うと「JavaScriptで開発している音ゲー」です。現在は開発中であり部分的にしか遊ぶことが出来ません。

最終的には、創作譜面を作ってそれで遊んだりできるモノに仕上げたいと考えております。

# ライセンスについて
このゲーム自体をそのまま使って利益を得るような行為は辞めて頂くようお願いいたします。

このゲームに出てくるノーツの種類や色合いはとあるゲームに似せて作っています。もちろん、私は誓って元ネタのデータを抜き取るなどの行為はしていません。あくまで似たシステムを採用しているだけであり、ですので問題視されることはないと考えております。

しかし、乱用が過ぎるとこのレポジトリを消す必要が出てくる可能性があります。このレポジトリを多くの人に有効活用して頂けるよう、節度を守ってご利用いただければと思います。

詳しくは以下の「ソースコードに関して」に記載しています。

# ソースコードに関して
ソースコードは基本的にはご自由に使って頂けます。ただし、上に書いておりますように、**このゲームをそのままコピー、および改造して利益を得るような行為は辞めて頂くよう**お願いします。

例えば「このプログラムで使われているWebGLのラッパー（Painter.js）やシェーダー、その他技術をそのまま使い、全く違う趣旨のアプリを作る・売る」のは問題ないですが、「このプログラムをコピーし、似たような音ゲーを売る」のは禁止とします。

# 開発段階
- [x] WebGLを利用し、3D空間内でノーツを描画/移動できるようにする。
- [x] 画面幅（縦横比）によらず遊べるように、カメラの行列を工夫する。
- [x] 様々なパラメータをプログラムを少し書き換えるだけで調節出来るようにする。
- [x] タップ・フリックを検出できるようにする。
- [x] ノーツの判定を実装する。
- [x] 判定結果の表示
- [ ] コンボ数の表示を行う。
- [ ] パラメータを調節出来るようなUIを作る。
- [x] 譜面作成ツールを作る。
- [x] 譜面作成ツールにおいて、ロングノーツを消去できるようにする。
- [ ] 譜面作成ツールにおいて、ドラッグで画面スクロール出来るようにする。
- [x] 譜面作成ツールにおいて、BPMを変更できるようにする。
- [ ] 作った譜面のエラー（ロングノーツ中にそのレーンにタップノーツがある、など）を検出できるようにする。
- [x] どの譜面で遊ぶか選択し、その譜面で遊べるようにする。
- [ ] タップの早い/遅いをグラフ化して表示できるようにする。
- [ ] 楽曲と連動できるようにする。
- [ ] 譜面作成ツールに楽曲の波形を表示できるようにする。
- [x] <sub>元ネタとなったゲームに課金する</sub>
