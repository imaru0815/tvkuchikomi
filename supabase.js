import React from 'react';
import { createRoot } from 'react-dom/client';
import { Search, Star, Heart, Tv, Trophy, MessageCircle, PlusCircle } from 'lucide-react';
import { supabase, hasSupabase } from './lib/supabase';
import './style.css';

const WEEKLY = [
  [0,'07:30','シューイチ','日本テレビ系','情報'],
  [0,'19:00','ザ！鉄腕！DASH!!','日本テレビ系','バラエティ'],
  [0,'19:58','世界の果てまでイッテQ！','日本テレビ系','バラエティ'],
  [0,'21:00','日曜劇場','TBS系','ドラマ'],
  [0,'22:00','Mr.サンデー','フジテレビ系','報道・情報'],
  [0,'23:00','情熱大陸','MBS/TBS系','ドキュメンタリー'],
  [1,'19:00','有吉ゼミ','日本テレビ系','バラエティ'],
  [1,'20:00','世界まる見え！テレビ特捜部','日本テレビ系','バラエティ'],
  [1,'21:00','しゃべくり007','日本テレビ系','バラエティ'],
  [1,'21:54','報道ステーション','テレビ朝日系','報道'],
  [1,'23:00','news zero','日本テレビ系','報道'],
  [2,'20:55','マツコの知らない世界','TBS系','バラエティ'],
  [2,'21:00','ザ！世界仰天ニュース','日本テレビ系','バラエティ'],
  [2,'21:54','報道ステーション','テレビ朝日系','報道'],
  [2,'23:00','news zero','日本テレビ系','報道'],
  [3,'19:00','世界くらべてみたら','TBS系','バラエティ'],
  [3,'20:00','有吉の壁','日本テレビ系','バラエティ'],
  [3,'21:00','上田と女が吠える夜','日本テレビ系','バラエティ'],
  [3,'22:00','水曜日のダウンタウン','TBS系','バラエティ'],
  [3,'21:54','報道ステーション','テレビ朝日系','報道'],
  [3,'23:00','news zero','日本テレビ系','報道'],
  [4,'19:00','プレバト!!','MBS/TBS系','バラエティ'],
  [4,'19:00','突破ファイル','日本テレビ系','バラエティ'],
  [4,'22:00','櫻井・有吉THE夜会','TBS系','バラエティ'],
  [4,'21:54','報道ステーション','テレビ朝日系','報道'],
  [4,'23:00','news zero','日本テレビ系','報道'],
  [5,'20:00','それSnow Manにやらせて下さい','TBS系','バラエティ'],
  [5,'20:00','沸騰ワード10','日本テレビ系','バラエティ'],
  [5,'23:00','A-Studio+','TBS系','トーク'],
  [5,'21:54','報道ステーション','テレビ朝日系','報道'],
  [5,'23:30','news zero','日本テレビ系','報道'],
  [6,'19:00','嗚呼!!みんなの動物園','日本テレビ系','バラエティ'],
  [6,'21:00','出没！アド街ック天国','テレビ東京系','情報・街'],
  [6,'22:00','情報7daysニュースキャスター','TBS系','報道・情報'],
];

const JWD = ['日','月','火','水','木','金','土'];
const tags = ['神回','笑った','泣けた','考えさせられた','演出が良い','出演者が良い','惜しい'];

function slug(s){return encodeURIComponent(s).replaceAll('%','').slice(0,30)}
function ymd(d){const x=new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`}
function dateLabel(s){const d=new Date(`${s}T00:00:00`);return `${d.getMonth()+1}/${d.getDate()}(${JWD[d.getDay()]})`}
function stars(n){return '★★★★★'.slice(0,n)+'☆☆☆☆☆'.slice(0,5-n)}
function avg(list){return list.length ? list.reduce((a,b)=>a+Number(b.rating),0)/list.length : 0}
function fmt(n){return n ? n.toFixed(1) : '-'}
function localGet(k,f){try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return f}}
function localSet(k,v){localStorage.setItem(k,JSON.stringify(v))}

function buildPrograms(){
  const today = new Date(); today.setHours(0,0,0,0);
  const map = new Map();
  for(let off=-7; off<=7; off++){
    const d = new Date(today); d.setDate(today.getDate()+off);
    WEEKLY.filter(x=>x[0]===d.getDay()).forEach(([dow,time,title,station,genre])=>{
      const pid = `p_${slug(title)}`;
      if(!map.has(pid)) map.set(pid,{id:pid,title,station,genre,episodes:[]});
      const date = ymd(d);
      map.get(pid).episodes.push({id:`e_${slug(title)}_${date}`,program_id:pid,date,time,title:`${dateLabel(date)}放送回`});
    });
  }
  return [...map.values()].map(p=>({...p,episodes:p.episodes.sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))}));
}

function App(){
  const [programs,setPrograms] = React.useState([]);
  const [reviews,setReviews] = React.useState([]);
  const [liked,setLiked] = React.useState(localGet('liked_v2',[]));
  const [view,setView] = React.useState('schedule');
  const [mode,setMode] = React.useState('now');
  const [selected,setSelected] = React.useState(null);
  const [search,setSearch] = React.useState('');
  const [reviewFilter,setReviewFilter] = React.useState('');
  const [revealed,setRevealed] = React.useState({});

  React.useEffect(()=>{ loadData(); },[]);
  React.useEffect(()=>{ localSet('liked_v2',liked); },[liked]);

  async function loadData(){
    const seed = buildPrograms();
    if(hasSupabase){
      const { data: pRows } = await supabase.from('programs').select('*');
      const { data: eRows } = await supabase.from('episodes').select('*');
      const { data: rRows } = await supabase.from('reviews').select('*').order('created_at',{ascending:false});
      if(pRows?.length){
        const merged = pRows.map(p=>({...p,episodes:(eRows||[]).filter(e=>e.program_id===p.id)}));
        const missingSeed = seed.filter(sp=>!merged.some(mp=>mp.id===sp.id));
        setPrograms([...merged,...missingSeed]);
      } else {
        setPrograms(seed);
      }
      setReviews(rRows||[]);
    } else {
      const custom = localGet('custom_programs_v2',[]);
      setPrograms([...seed,...custom]);
      setReviews(localGet('reviews_v2',[]));
    }
  }

  const allEpisodes = React.useMemo(()=>programs.flatMap(p=>p.episodes.map(e=>({program:p,episode:e}))).sort((a,b)=>(a.episode.date+a.episode.time).localeCompare(b.episode.date+b.episode.time)),[programs]);

  function isNow(e){
    const now = new Date();
    const start = new Date(`${e.date}T${e.time}:00`);
    const end = new Date(start); end.setMinutes(end.getMinutes()+60);
    return now>=start && now<=end;
  }

  function scheduleEpisodes(){
    const today = ymd(new Date());
    if(mode==='now') return allEpisodes.filter(x=>isNow(x.episode));
    if(mode==='today') return allEpisodes.filter(x=>x.episode.date===today);
    return allEpisodes;
  }

  function epReviews(pid,eid){return reviews.filter(r=>r.program_id===pid||r.programId===pid).filter(r=>r.episode_id===eid||r.episodeId===eid)}
  function programReviews(pid){return reviews.filter(r=>(r.program_id||r.programId)===pid)}
  function select(program,episode=null){setSelected({program,episode:episode||nearest(program)});setSearch(program.title);setView('post')}
  function nearest(program){const today=ymd(new Date());return program.episodes.find(e=>e.date>=today)||program.episodes.at(-1)}

  async function addReview(payload){
    const item = {
      program_id:selected.program.id,
      episode_id:selected.episode.id,
      rating:Number(payload.rating),
      spoiler:payload.spoiler==='true',
      tag:payload.tag,
      comment:payload.comment,
      likes:0,
      author_name:'匿名ユーザー'
    };
    if(!item.comment.trim()) return alert('感想を入力してください');
    if(hasSupabase){
      await supabase.from('reviews').insert(item);
      await loadData();
    }else{
      const local = [{...item,id:`r_${Date.now()}`,created_at:new Date().toISOString()},...reviews];
      setReviews(local); localSet('reviews_v2',local);
    }
    setView('reviews');
  }

  async function like(review){
    const id = review.id;
    const already = liked.includes(id);
    const nextLikes = Math.max(0,(review.likes||0)+(already?-1:1));
    setLiked(already ? liked.filter(x=>x!==id) : [...liked,id]);
    if(hasSupabase){
      await supabase.from('reviews').update({likes:nextLikes}).eq('id',id);
      await loadData();
    }else{
      const next = reviews.map(r=>r.id===id?{...r,likes:nextLikes}:r);
      setReviews(next); localSet('reviews_v2',next);
    }
  }

  async function addProgram(e){
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = fd.get('title').trim(), station=fd.get('station').trim();
    if(!title || !station) return alert('番組名と系列・局を入力してください');
    const date = ymd(new Date()), time=fd.get('time')||'20:00';
    const program = {id:`custom_${Date.now()}`,title,station,genre:fd.get('genre')||'未分類'};
    const episode = {id:`episode_${Date.now()}`,program_id:program.id,date,time,title:fd.get('episodeTitle')||'最新放送回'};
    if(hasSupabase){
      await supabase.from('programs').insert(program);
      await supabase.from('episodes').insert(episode);
      await loadData();
    }else{
      const custom = localGet('custom_programs_v2',[]);
      custom.push({...program,episodes:[episode]});
      localSet('custom_programs_v2',custom);
      setPrograms([...buildPrograms(),...custom]);
    }
    e.currentTarget.reset();
  }

  const ranking = React.useMemo(()=>{
    const rows=[];
    programs.forEach(p=>p.episodes.forEach(e=>{
      const list=epReviews(p.id,e.id);
      if(list.length) rows.push({program:p,episode:e,count:list.length,average:avg(list),score:avg(list)*list.length,likes:list.reduce((s,r)=>s+(r.likes||0),0)});
    }));
    return rows;
  },[programs,reviews]);

  const filteredReviews = reviews.filter(r=>{
    const p = programs.find(p=>p.id===(r.program_id||r.programId));
    const q = reviewFilter.toLowerCase();
    return !q || p?.title.toLowerCase().includes(q) || p?.station.toLowerCase().includes(q) || r.tag?.toLowerCase().includes(q);
  });

  return <div>
    <header className="header"><div className="brand"><Tv/><div><b>TV口コミログ</b><span>放送回ごとのテレビ口コミ</span></div></div><div className="supabase">{hasSupabase?'Supabase接続中':'localStorage版'}</div></header>
    <main className="container">
      <section className="hero"><h1>前後1週間の全国ネット番組から口コミ。</h1><p>番組名は候補から選択。表記ゆれを防ぎ、放送回ごとに平均評価・口コミ・いいね・ランキングを集計します。</p></section>
      <nav className="tabs">{[['schedule','番組表'],['post','口コミを書く'],['reviews','最新口コミ'],['ranking','ランキング'],['admin','番組追加']].map(t=><button key={t[0]} className={view===t[0]?'active':''} onClick={()=>setView(t[0])}>{t[1]}</button>)}</nav>

      {view==='schedule' && <div className="grid"><section className="card">
        <div className="head"><h2>番組表</h2><span>前後1週間・主要全国ネット番組</span></div>
        <div className="tabs smalltabs">{[['now','📺 放送中'],['today','📅 今日'],['week','🗓 前後1週間']].map(t=><button key={t[0]} className={mode===t[0]?'active':''} onClick={()=>setMode(t[0])}>{t[1]}</button>)}</div>
        <EpisodeList episodes={scheduleEpisodes()} epReviews={epReviews} programReviews={programReviews} onSelect={select} mode={mode}/>
      </section><aside><Ranking title="今夜の神回ランキング" rows={[...ranking].sort((a,b)=>b.average-a.average).slice(0,5)}/><Ranking title="口コミ数ランキング" rows={[...ranking].sort((a,b)=>b.count-a.count).slice(0,5)} type="count"/></aside></div>}

      {view==='post' && <div className="grid"><section className="card">
        <h2>口コミを書く</h2>
        {selected && <div className="selected">選択中：{selected.program.title} ／ {selected.episode.date} {selected.episode.time} {selected.episode.title}</div>}
        <label>番組を検索して選択</label><div className="searchbox"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="例：水曜日、情熱大陸、報道"/></div>
        {search && <div className="suggest">{programs.filter(p=>(p.title+p.station+p.genre).toLowerCase().includes(search.toLowerCase())).slice(0,8).map(p=><button key={p.id} onClick={()=>select(p)}>{p.title}<span>{p.station} ／ {p.genre}</span></button>)}</div>}
        <ReviewForm selected={selected} onSubmit={addReview} setSelected={setSelected}/>
      </section><aside className="card"><h2>選べる番組候補</h2>{programs.slice(0,10).map(p=><ProgramCard key={p.id} p={p} onClick={()=>select(p)} average={avg(programReviews(p.id))} count={programReviews(p.id).length}/>)}</aside></div>}

      {view==='reviews' && <section className="card"><div className="head"><h2>最新口コミ</h2><span>ネタバレはタップで表示</span></div><input value={reviewFilter} onChange={e=>setReviewFilter(e.target.value)} placeholder="番組名・局名・タグで検索"/>{filteredReviews.length?filteredReviews.map(r=><Review key={r.id} r={r} programs={programs} liked={liked.includes(r.id)} onLike={()=>like(r)} revealed={revealed[r.id]} reveal={()=>setRevealed({...revealed,[r.id]:true})}/>):<Empty text="まだ口コミがありません。"/>}</section>}

      {view==='ranking' && <div className="grid">
        <Ranking title="神回ランキング" rows={[...ranking].sort((a,b)=>b.average-a.average).slice(0,10)}/>
        <Ranking title="急上昇ランキング" rows={[...ranking].sort((a,b)=>b.score-a.score).slice(0,10)} type="rising"/>
        <Ranking title="口コミ数ランキング" rows={[...ranking].sort((a,b)=>b.count-a.count).slice(0,10)} type="count"/>
        <section className="card"><h2>いいねランキング</h2>{[...reviews].sort((a,b)=>(b.likes||0)-(a.likes||0)).slice(0,10).map((r,i)=><ReviewRank key={r.id} r={r} i={i} programs={programs}/>) || <Empty text="まだランキングはありません。"/>}</section>
      </div>}

      {view==='admin' && <div className="grid"><section className="card"><h2>番組候補に追加</h2><form onSubmit={addProgram}><label>番組名</label><input name="title"/><label>系列・局</label><input name="station"/><label>ジャンル</label><input name="genre"/><label>放送時刻</label><input name="time" placeholder="20:00"/><label>放送回タイトル</label><input name="episodeTitle"/><button className="primary">追加</button></form></section><section className="card"><h2>現在の番組マスター</h2>{programs.map(p=><ProgramCard key={p.id} p={p} average={avg(programReviews(p.id))} count={programReviews(p.id).length}/>)}</section></div>}
    </main>
  </div>
}

function EpisodeList({episodes,epReviews,programReviews,onSelect,mode}){
  let last='';
  if(!episodes.length) return <Empty text="該当する番組がありません。「今日」または「前後1週間」を見てください。"/>;
  return <>{episodes.map(({program,episode})=>{
    const showHead = mode==='week' && last!==episode.date; last=episode.date;
    return <React.Fragment key={episode.id}>{showHead && <h3 className="datehead">{dateLabel(episode.date)}</h3>}<ProgramCard p={program} episode={episode} onClick={()=>onSelect(program,episode)} average={avg(epReviews(program.id,episode.id))} count={epReviews(program.id,episode.id).length} pAvg={avg(programReviews(program.id))}/></React.Fragment>
  })}</>
}

function ProgramCard({p,episode,onClick,average,count,pAvg}){
  return <article className="program" onClick={onClick}><div><h3>{episode?`${episode.time}　`:''}{p.title}</h3><p>{p.station} ／ {p.genre}{episode?` ／ ${episode.title}`:''}</p></div><div className="badges"><span>⭐ {fmt(average)}</span><span>口コミ {count}</span>{pAvg!==undefined&&<span>番組平均 {fmt(pAvg)}</span>}</div></article>
}

function ReviewForm({selected,onSubmit,setSelected}){
  const [form,setForm]=React.useState({rating:'5',spoiler:'false',tag:'神回',comment:''});
  if(!selected) return <Empty text="先に番組を選んでください。"/>;
  return <form onSubmit={e=>{e.preventDefault();onSubmit(form);setForm({...form,comment:''})}}>
    <label>放送回</label><select value={selected.episode.id} onChange={e=>setSelected({...selected,episode:selected.program.episodes.find(x=>x.id===e.target.value)})}>{selected.program.episodes.map(e=><option key={e.id} value={e.id}>{e.date} {e.time} {e.title}</option>)}</select>
    <div className="formgrid"><div><label>評価</label><select value={form.rating} onChange={e=>setForm({...form,rating:e.target.value})}>{[5,4,3,2,1].map(n=><option key={n} value={n}>{stars(n)}</option>)}</select></div><div><label>タグ</label><select value={form.tag} onChange={e=>setForm({...form,tag:e.target.value})}>{tags.map(t=><option key={t}>{t}</option>)}</select></div></div>
    <label>ネタバレ</label><select value={form.spoiler} onChange={e=>setForm({...form,spoiler:e.target.value})}><option value="false">ネタバレなし</option><option value="true">ネタバレあり</option></select>
    <label>感想</label><textarea value={form.comment} onChange={e=>setForm({...form,comment:e.target.value})}/>
    <button className="primary">投稿する</button>
  </form>
}

function Review({r,programs,liked,onLike,revealed,reveal}){
  const p=programs.find(p=>p.id===(r.program_id||r.programId)); const e=p?.episodes.find(e=>e.id===(r.episode_id||r.episodeId));
  return <article className="review"><div className="reviewhead"><div><b>{p?.title}</b><p>{p?.station} ／ {e?.date} {e?.time} {e?.title}</p></div><strong className="stars">{stars(r.rating)}</strong></div><div className="badges"><span>#{r.tag}</span><span>{r.spoiler?'ネタバレあり':'ネタバレなし'}</span></div><p className={r.spoiler&&!revealed?'blur':''} onClick={reveal}>{r.comment}</p><button className={liked?'like liked':'like'} onClick={onLike}><Heart size={16}/> {r.likes||0}</button></article>
}

function Ranking({title,rows,type}){
  return <section className="card"><h2>{title}</h2>{rows.length?rows.map((x,i)=><div className="rankitem" key={x.episode.id}><b>{i+1}</b><div><strong>{x.program.title}</strong><p>{x.episode.date} {x.episode.time} ／ {type==='count'?`口コミ ${x.count}`:type==='rising'?`勢い ${x.score.toFixed(1)}`:`平均 ${fmt(x.average)}`} ／ {x.count}件</p></div></div>):<Empty text="まだランキングはありません。"/>}</section>
}

function ReviewRank({r,i,programs}){const p=programs.find(p=>p.id===(r.program_id||r.programId));return <div className="rankitem"><b>{i+1}</b><div><strong>{p?.title}</strong><p>❤️ {r.likes||0} ／ {stars(r.rating)}</p></div></div>}
function Empty({text}){return <div className="empty">{text}</div>}

createRoot(document.getElementById('root')).render(<App />);
