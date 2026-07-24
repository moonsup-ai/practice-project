(()=>{
  const style=document.createElement('style');
  style.textContent=`
    .archive-rights{height:100%;display:grid;place-items:center;padding:20px;text-align:center;background:linear-gradient(145deg,#e9e1d4,#f6f1e8);color:#5f6863}
    .archive-rights strong{display:block;font-family:Georgia,serif;font-size:1.08rem;color:#27342f;margin-bottom:7px}
    .archive-rights span{position:static!important;display:inline-block;margin-top:10px;background:#27342f!important;color:#fff!important}
    .archive-rights small{display:block;font-size:.73rem;line-height:1.5}
  `;
  document.head.appendChild(style);

  const routeItems=[...document.querySelectorAll('.schedule-item')];
  const drive=routeItems.find(x=>x.querySelector('h3')?.textContent.includes('자가용'));
  if(drive){
    const p=drive.querySelector('p');
    if(p)p.textContent='Fort Tryon Park에서 출발해 Fifth Avenue와 80th Street에 있는 The Met 주차장으로 이동합니다. 차량 회수와 주차까지 포함해 약 45분을 잡으세요.';
  }
  const note=document.querySelector('#route .note');
  if(note)note.innerHTML='<b>자가용 이동 팁:</b> 클로이스터 주차장은 무료지만 자리가 제한적입니다. 본관 주차장 입구는 Fifth Avenue와 80th Street에 있으며, 평일은 오후 6시부터 자정까지, 주말은 24시간 이용할 수 있습니다. 수용 공간이 제한되어 주차가 보장되지는 않으므로 가능하면 사전 예약하세요. 차량 높이 제한은 6피트 6인치입니다. 6시에 나가야 한다면 Washington, Monet, Van Gogh를 생략하세요.';

  const restricted=new Set(['Autumn Rhythm: Number 30, 1950','Gertrude Stein']);
  const makeFallback=(card,reason='저작권 보호 이미지')=>{
    const thumb=card.querySelector('.archive-thumb');
    const room=thumb?.querySelector('span')?.textContent||'위치 확인';
    if(!thumb)return;
    thumb.innerHTML=`<div class="archive-rights"><div><strong>${reason}</strong><small>The Met 공식 페이지에서는 작품 정보를 확인할 수 있습니다.<br>작품 이미지는 현장에서 감상해 주세요.</small><span>${room}</span></div></div>`;
  };
  document.querySelectorAll('.archive-card').forEach(card=>{
    const title=card.querySelector('h3')?.textContent.trim();
    if(restricted.has(title)){
      makeFallback(card,'저작권 제한 · 현장 감상');
      return;
    }
    const img=card.querySelector('.archive-thumb img');
    if(img){
      img.addEventListener('error',()=>makeFallback(card,'이미지 제공 없음'),{once:true});
      if(img.complete&&img.naturalWidth===0)makeFallback(card,'이미지 제공 없음');
    }else{
      makeFallback(card,'이미지 제공 없음');
    }
  });
})();