(function() {
  'use strict';

  let data = JSON.parse(localStorage.getItem('photoVault')) || { categories: {}, albums: {} };
  const catSelect = document.getElementById('categorySelect');
  const gallery = document.getElementById('gallery');
  const searchBox = document.getElementById('searchBox');
  const albumModal = document.getElementById('albumModal');
  const modalAlbumTitle = document.getElementById('modalAlbumTitle');
  const albumModalContent = document.getElementById('albumModalContent');

  function renderGallery(){
    gallery.innerHTML='';
    const search = searchBox.value.toLowerCase();
    Object.keys(data.categories||{}).forEach(cat=>{
      data.categories[cat].forEach(photo=>{
        if(search && !photo.name.toLowerCase().includes(search) && !cat.toLowerCase().includes(search)) return;
        const div = document.createElement('div'); div.className='photo';
        div.innerHTML=`<img src="${photo.data}" alt="${photo.name}"><div class="photo-name">${photo.name}</div>`;
        gallery.appendChild(div);
      });
    });
    if(gallery.children.length===0){ gallery.innerHTML='<div class="empty-state"><i class="fas fa-image"></i> ไม่มีรูปภาพ</div>'; }
  }

  function loadCategories(){ 
    catSelect.innerHTML='';
    const keys=Object.keys(data.categories||{});
    if(keys.length===0){ const opt=document.createElement('option'); opt.textContent='-- ยังไม่มีหมวดหมู่ --'; opt.disabled=true; opt.selected=true; catSelect.appendChild(opt);}
    else keys.forEach(k=>{const opt=document.createElement('option'); opt.value=k; opt.textContent=k; catSelect.appendChild(opt);});
  }

  function viewAlbumByName(name){
    modalAlbumTitle.textContent=name; albumModalContent.innerHTML='';
    const photos=data.albums[name]?.photos||[];
    if(photos.length===0) albumModalContent.innerHTML='<p>อัลบั้มว่าง</p>';
    else photos.forEach(p=>{
      const img=document.createElement('img'); img.src=p.data; img.style.width='100%'; img.style.marginBottom='10px';
      albumModalContent.appendChild(img);
    });
    albumModal.style.display='flex';
  }

  window.closeAlbumModal=function(){ albumModal.style.display='none'; };

  // Load albums in gallery
  function loadAlbums(){
    Object.keys(data.albums||{}).forEach(name=>{
      const card=document.createElement('div'); card.className='album-card'; card.onclick=()=>viewAlbumByName(name);
      const cover=data.albums[name].photos[0]?.data||'https://via.placeholder.com/200x120?text=No+Image';
      card.innerHTML=`<div class="album-cover" style="background-image:url('${cover}')"></div><div class="album-info"><div class="album-name">${name}</div><div class="album-count">${data.albums[name].photos.length} รูป</div></div>`;
      gallery.appendChild(card);
    });
  }

  searchBox.addEventListener('input', renderGallery);

  // Initial load
  loadCategories();
  renderGallery();
  loadAlbums();

})();

