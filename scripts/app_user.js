(function() {
  'use strict';

  let data = { categories: {}, albums: {} };
  const catSelect = document.getElementById('categorySelect');
  const gallery = document.getElementById('gallery');
  const searchBox = document.getElementById('searchBox');
  const albumModal = document.getElementById('albumModal');
  const modalAlbumTitle = document.getElementById('modalAlbumTitle');
  const albumModalContent = document.getElementById('albumModalContent');
  const tabGallery = document.getElementById('tabGallery');
  const tabAlbums = document.getElementById('tabAlbums');

  let currentTab = 'gallery'; // gallery | albums

  async function loadData(){
    try{
      const res = await fetch('server/storage.json');
      data = await res.json();
      loadCategories();
      render();
    } catch(e){
      console.error('ไม่สามารถโหลดข้อมูลได้:', e);
      gallery.innerHTML='<p style="text-align:center;">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
    }
  }

  function renderGallery(){
    gallery.innerHTML='';
    const search = searchBox.value.toLowerCase();
    const cats = Object.keys(data.categories||{});
    cats.forEach(cat=>{
      data.categories[cat].forEach(photo=>{
        if(search && !photo.name.toLowerCase().includes(search) && !cat.toLowerCase().includes(search)) return;
        const div = document.createElement('div'); div.className='photo';
        div.innerHTML=`<img src="${photo.data}" alt="${photo.name}"><div class="photo-name">${photo.name}</div>`;
        gallery.appendChild(div);
      });
    });
    if(gallery.children.length===0) gallery.innerHTML='<div class="empty-state"><i class="fas fa-image"></i> ไม่มีรูปภาพ</div>';
  }

  function renderAlbums(){
    gallery.innerHTML='';
    const search = searchBox.value.toLowerCase();
    const albums = Object.keys(data.albums||{});
    if(albums.length===0){
      gallery.innerHTML='<div class="empty-state"><i class="fas fa-folder"></i> ยังไม่มีอัลบั้ม</div>';
      return;
    }
    albums.forEach(name=>{
      if(search && !name.toLowerCase().includes(search)) return;
      const card = document.createElement('div'); card.className='album-card';
      card.onclick=()=>viewAlbumByName(name);
      const cover=data.albums[name].photos[0]?.data||'https://via.placeholder.com/200x120?text=No+Image';
      card.innerHTML=`<div class="album-cover" style="background-image:url('${cover}')"></div>
        <div class="album-info">
          <div class="album-name">${name}</div>
          <div class="album-count">${data.albums[name].photos.length} รูป</div>
        </div>`;
      gallery.appendChild(card);
    });
    if(gallery.children.length===0) gallery.innerHTML='<div class="empty-state"><i class="fas fa-folder"></i> ไม่พบอัลบั้ม</div>';
  }

  function render(){
    if(currentTab==='gallery'){
      catSelect.style.display='inline-block';
      renderGallery();
    } else {
      catSelect.style.display='none';
      renderAlbums();
    }
  }

  function loadCategories(){ 
    catSelect.innerHTML='';
    const keys=Object.keys(data.categories||{});
    if(keys.length===0){ 
      const opt=document.createElement('option'); 
      opt.textContent='-- ยังไม่มีหมวดหมู่ --'; 
      opt.disabled=true; opt.selected=true; 
      catSelect.appendChild(opt);
    }
    else keys.forEach(k=>{
      const opt=document.createElement('option'); 
      opt.value=k; opt.textContent=k; 
      catSelect.appendChild(opt);
    });
  }

  function viewAlbumByName(name){
    modalAlbumTitle.textContent=name; 
    albumModalContent.innerHTML='';
    const photos=data.albums[name]?.photos||[];
    if(photos.length===0) albumModalContent.innerHTML='<p>อัลบั้มว่าง</p>';
    else photos.forEach(p=>{
      const img=document.createElement('img'); 
      img.src=p.data; img.style.width='100%'; img.style.marginBottom='10px';
      albumModalContent.appendChild(img);
    });
    albumModal.style.display='flex';
  }

  window.closeAlbumModal=function(){ albumModal.style.display='none'; };

  searchBox.addEventListener('input', render);
  tabGallery.addEventListener('click', ()=>{
    currentTab='gallery';
    tabGallery.classList.add('active');
    tabAlbums.classList.remove('active');
    render();
  });
  tabAlbums.addEventListener('click', ()=>{
    currentTab='albums';
    tabAlbums.classList.add('active');
    tabGallery.classList.remove('active');
    render();
  });

  loadData();

})();
