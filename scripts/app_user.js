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
  const imageModal = document.getElementById('imageModal');
  const modalImageTitle = document.getElementById('modalImageTitle');
  const imageModalContent = document.getElementById('imageModalContent');

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
    let hasResults = false;
    
    cats.forEach(cat=>{
      data.categories[cat].forEach(photo=>{
        if(search && !photo.name.toLowerCase().includes(search) && !cat.toLowerCase().includes(search)) return;
        hasResults = true;
        const div = document.createElement('div'); 
        div.className='photo';
        div.innerHTML=`
          <img src="${photo.data}" alt="${photo.name}">
          <div class="photo-name">${photo.name}</div>
        `;
        div.addEventListener('click', () => viewImage(photo.data, photo.name));
        gallery.appendChild(div);
      });
    });
    
    if(!hasResults) {
      gallery.innerHTML='<div class="empty-state"><i class="fas fa-image"></i> ไม่พบรูปภาพที่ตรงกับการค้นหา</div>';
    }
  }

  function renderAlbums(){
    gallery.innerHTML='';
    const search = searchBox.value.toLowerCase();
    const albums = Object.keys(data.albums||{});
    
    if(albums.length===0){
      gallery.innerHTML='<div class="empty-state"><i class="fas fa-folder"></i> ยังไม่มีอัลบั้ม</div>';
      return;
    }
    
    let hasResults = false;
    albums.forEach(name=>{
      if(search && !name.toLowerCase().includes(search)) return;
      hasResults = true;
      const card = document.createElement('div'); 
      card.className='album-card';
      card.onclick=()=>viewAlbumByName(name);
      const cover=data.albums[name].photos[0]?.data||'https://via.placeholder.com/200x120?text=No+Image';
      card.innerHTML=`
        <div class="album-cover" style="background-image:url('${cover}')"></div>
        <div class="album-info">
          <div class="album-name">${name}</div>
          <div class="album-count">${data.albums[name].photos.length} รูป</div>
        </div>`;
      gallery.appendChild(card);
    });
    
    if(!hasResults) {
      gallery.innerHTML='<div class="empty-state"><i class="fas fa-folder"></i> ไม่พบอัลบั้มที่ตรงกับการค้นหา</div>';
    }
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
      opt.disabled=true; 
      opt.selected=true; 
      catSelect.appendChild(opt);
    }
    else {
      // เพิ่มตัวเลือก "ทั้งหมด"
      const allOpt = document.createElement('option');
      allOpt.value = '';
      allOpt.textContent = 'ทั้งหมด';
      allOpt.selected = true;
      catSelect.appendChild(allOpt);
      
      keys.forEach(k=>{
        const opt=document.createElement('option'); 
        opt.value=k; 
        opt.textContent=k; 
        catSelect.appendChild(opt);
      });
    }
  }

  function viewAlbumByName(name){
    modalAlbumTitle.textContent=name; 
    albumModalContent.innerHTML='';
    const photos=data.albums[name]?.photos||[];
    
    if(photos.length===0) {
      albumModalContent.innerHTML='<p>อัลบั้มว่าง</p>';
    } else {
      // สร้างกริดสำหรับรูปภาพในอัลบั้ม
      const grid = document.createElement('div');
      grid.className = 'album-photo-grid';
      
      photos.forEach((p, index)=>{
        const item = document.createElement('div');
        item.className = 'album-photo-item';
        item.innerHTML = `<img src="${p.data}" alt="${p.name}">`;
        item.addEventListener('click', () => viewImage(p.data, p.name));
        grid.appendChild(item);
      });
      
      albumModalContent.appendChild(grid);
    }
    
    albumModal.style.display='flex';
  }

  function viewImage(src, title) {
    modalImageTitle.textContent = title;
    imageModalContent.innerHTML = `<img src="${src}" alt="${title}">`;
    imageModal.style.display = 'flex';
  }

  window.closeAlbumModal = function(){ 
    albumModal.style.display='none'; 
  };

  window.closeImageModal = function(){ 
    imageModal.style.display='none'; 
  };

  // ปิด modal เมื่อคลิกนอกเนื้อหา
  window.addEventListener('click', function(event) {
    if (event.target === albumModal) {
      closeAlbumModal();
    }
    if (event.target === imageModal) {
      closeImageModal();
    }
  });

  // ปิด modal ด้วยปุ่ม ESC
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      closeAlbumModal();
      closeImageModal();
    }
  });

  searchBox.addEventListener('input', render);
  
  // เพิ่มการกรองตามหมวดหมู่
  catSelect.addEventListener('change', function() {
    renderFilteredGallery();
  });
  
  function renderFilteredGallery() {
    if (currentTab !== 'gallery') return;
    
    gallery.innerHTML='';
    const search = searchBox.value.toLowerCase();
    const selectedCategory = catSelect.value;
    const cats = selectedCategory ? [selectedCategory] : Object.keys(data.categories||{});
    
    let hasResults = false;
    
    cats.forEach(cat=>{
      data.categories[cat].forEach(photo=>{
        if(search && !photo.name.toLowerCase().includes(search) && !cat.toLowerCase().includes(search)) return;
        hasResults = true;
        const div = document.createElement('div'); 
        div.className='photo';
        div.innerHTML=`
          <img src="${photo.data}" alt="${photo.name}">
          <div class="photo-name">${photo.name}</div>
        `;
        div.addEventListener('click', () => viewImage(photo.data, photo.name));
        gallery.appendChild(div);
      });
    });
    
    if(!hasResults) {
      gallery.innerHTML='<div class="empty-state"><i class="fas fa-image"></i> ไม่พบรูปภาพที่ตรงกับการค้นหา</div>';
    }
  }
  
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
