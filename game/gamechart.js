/*
This file includes GameChart object.
It must be independent from other programs (except initials.js and note.js)
*/

const GameChart = {
  notes: [],
  connections: [],
  BPM: [],
  decode:function(text){
    this.notes = [];
    this.connections = [];
    this.BPM = [];
    let lines = text.split("\n");
    if(lines.length >= 1 && lines[0].length > 0){
      let notedata = lines[0].split(",");
      for (let notedatam of notedata) {
        let buf = [0,0,0,0,0,0,0,0,0,0,0,0];
        for (let i = 0; i < notedatam.length; i++) {
          if (i == 12) break;
          if (notedatam[i] == "T") buf[i] = 1;
          else if (notedatam[i] == "F") buf[i] = 2;
          else if (notedatam[i] == "t") buf[i] = 3;
          else if (notedatam[i] == "f") buf[i] = 4;
          else buf[i] = 0;
        }
        this.notes.push(buf);
      }
    }
    if(lines.length >= 2 && lines[0].length > 0){
      let connectiondata = lines[1].split(",");
      for (const connectiondatam of connectiondata) {
        let buf = connectiondatam.split(":");
        if (buf.length < 4) continue;
        this.connections.push({ fromTick: parseInt(buf[0]), fromPlace: parseInt(buf[1]), toTick: parseInt(buf[2]), toPlace: parseInt(buf[3]) });
      }
    }
    if(lines.length >= 3 && lines[2].length > 0){
      let BPMdata = lines[2].split(",");
      for (const BPMdatam of BPMdata) {
        let buf = BPMdatam.split(":");
        if (buf.length < 2) continue;
        this.BPM.push({ BPM: parseInt(buf[0]), fromTick: parseInt(buf[1]) });
      }
      this.BPM.sort((a, b)=>{a.fromTick-b.fromTick});
    }
    else{
      this.BPM.push( { BPM:120, fromTick:0 } );
    }
  },
  encode:function(){
    let text = "";
    if (this.notes.length > 0) {
      for (const note of this.notes) {
        for (let i = 0; i < 12; i++) {
          if (note[i] == 0) text += "-";
          else if (note[i] == 1) text += "T";
          else if (note[i] == 2) text += "F";
          else if (note[i] == 3) text += "t";
          else if (note[i] == 4) text += "f";
        }
        text += ","
      }
      text = text.substring(0, text.length - 1);
    }
    text += "\n";
    if (this.connections.length > 0) {
      for (const connection of this.connections) {
        text += "" + connection.fromTick + ":" + connection.fromPlace + ":" + connection.toTick + ":" + connection.toPlace + ",";
      }
      text = text.substring(0, text.length - 1);
    }
    text += "\n";
    if (this.BPM.length > 0) {
      this.BPM.sort((a, b)=>{a.fromTick-b.fromTick});
      for (const bpm of this.BPM) {
        text += "" + bpm.BPM + ":" + bpm.fromTick + ",";
      }
      text = text.substring(0, text.length - 1);
    }
    return text;
  },
  toNotes:function(){
    this.BPM.sort((a, b)=>{a.fromTick-b.fromTick});
    let timelut = [];
    let currentTime = 0;
    for(let i = 0; i<this.BPM.length; i++){
      const fromTick = (i == 0 ? 0 : this.BPM[i].fromTick);
      const toTick = (i==this.BPM.length - 1 ? this.notes.length : this.BPM[i + 1].fromTick);
      const bpm = this.BPM[i].BPM;
      for (let t = fromTick; t < toTick; t++) {
        timelut.push(currentTime);
        currentTime += (30000 / bpm); // 30000 = 60[s] / 2[tick per beat] * 1000[s to ms]
      }
    }
    
    let data = [];
    for (let t = 0; t < this.notes.length; t++) {
      const note = this.notes[t];
      const time = timelut[t];
      for (let i = 0; i < 12; i++) {
        if (note[i] != 0) {
          const place = i;
          while (i + 1 < 12 && note[place] == note[i + 1]) i++;
          const notetype = (note[place] == 1 || note[place] == 3 ? NOTETYPE_TAP : NOTETYPE_FLICK);
          let connectTime=null;
          let connectPlace=null;
          for (const connection of this.connections) {
            const fromTick=Math.min(connection.fromTick,connection.toTick);
            const toTick=Math.max(connection.fromTick,connection.toTick);
            let fromPlace=connection.fromPlace;
            let toPlace=connection.toPlace;
            if(connection.fromTime>connection.toTime) {
              fromPlace=connection.toPlace;
              toPlace=connection.fromPlace;
            }
            if(fromTick==t && place <= fromPlace && fromPlace < i){
              if(toTick >= this.notes.length || this.notes[toTick][toPlace] == 0) break; //Error!
              while(toPlace != 0 && this.notes[toTick][toPlace - 1] == this.notes[toTick][toPlace])toPlace--;
              connectTime=timelut[toTick];
              connectPlace=toPlace;
              break;
            }
          }
          data.push(new Note(time, place, i-place+1,notetype, connectTime, connectPlace));
        }
      }
    }
    return data;
  }
};
