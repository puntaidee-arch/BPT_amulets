let isAdmin=false;
let data=JSON.parse(localStorage.getItem('photoVault'))||{categories:{},albums:{}};

const catSelect=document.getElementById('categorySelect');
const gallery=document.getElementById('gallery');
const toast=document.getElementById('toast');
const adminBadge=document.getElementById('adminBadge');
const loginOverlay=document.getElementById('loginOverlay');
const albumSelect=document.getElementById('albumSelect');
const albumList=document.getElementById('albumList');

// Toast
function showToast(msg,isError=false){toast.textContent=msg;toast.className='toast';if(isError) toast.classList.add('error');toast.classList.add('show');setTimeout(()=>{toast.classList.remove('show');},3000);}

// Save
function saveData(){localStorage.setItem('photoVault',JSON.stringify(data));}

// Login
function showLogin(){loginOverlay.style.display='flex';}
function closeLogin(){loginOverlay.style.display='none';}
function login(){const pass=document.getElementById('adminPass').value;if(pass==='admin2888888882'){isAdmin=true;loginOverlay.style.display='none';document.querySelectorAll('.admin-only').forEach(el=>el.style.display=el.id==='upload-area'?'block':'inline-block');adminBadge.style.display='block';renderGallery();showToast('เข้าสู่ระบบผู้ดูแลระบบสำเร็จ');}else showToast('รหัสผ่านไม่ถูกต้อง',true);}
function logout(){if(confirm('คุณต้องการออกจากระบบผู้ดูแลระบบหรือไม่?')){isAdmin=false;document.querySelectorAll('.admin-only').forEach(el=>el.style.display='none');adminBadge.style.display='none';renderGallery();showToast('ออกจากระบบสำเร็จ');}}

// Categories
function loadCategories(){catSelect.innerHTML='';const keys=Object.keys(data.categories||{});if(keys.length===0){const opt=document.createElement('option');opt.textContent='-- ไม่มีหมวดหมู่ --';opt.disabled=true;opt.selected=true;catSelect.appendChild(opt);}else keys.forEach(k=>{const opt=document.createElement('option');opt.value=k;opt.textContent=k;catSelect.appendChild(opt);});}
function addCategory(){if(!isAdmin){showToast('เฉพาะผู้ดูแลระบบ',true);return;}const name=prompt('ชื่อหมวดหมู่ใหม่:');if(!name)return;if(data.categories[name]){showToast('มีหมวดหมู่นี้อยู่แล้ว',true);return;}data.categories[name]=[];saveData();loadCategories();renderGallery();showToast(`เพิ่มหมวด "${name}" สำเร็จ`);}
function deleteCategory(){if(!isAdmin){showToast('เฉพาะผู้ดูแลระบบ',true);return;}const cat=catSelect.value;if(!cat){showToast('ยังไม่มีหมวดหมู่ให้ลบ',true);return;}if(confirm(`ลบหมวด "${cat}" พร้อมรูปทั้งหมด?`)){delete data.categories[cat];saveData();loadCategories();renderGallery();showToast(`ลบหมวด "${cat}" สำเร็จ`);}}
catSelect.addEventListener('change',renderGallery);

// Upload
document.getElementById('fileInput').addEventListener('change',function(e){if(!isAdmin){showToast("เฉพาะผู้ดูแลระบบ",true);return;}const cat=catSelect.value;if(!cat||!data.categories[cat]){showToast('เลือกหมวดหมู่ก่อน',true);return;}const files=Array.from(e.target.files);files.forEach(f=>{if(!f.type.includes('image')){showToast(f.name+' ไม่ใช่รูป',true);return;}const reader=new FileReader();reader.onload=ev=>{data.categories[cat].push({name:f.name,src:ev.target.result});saveData();renderGallery();};reader.readAsDataURL(f);});});

// Gallery
function renderGallery(){gallery.innerHTML='';const cat=catSelect.value;const search=document.getElementById('searchBox').value.toLowerCase();if(!cat||!data.categories[cat])return;data.categories[cat].forEach((imgObj,i)=>{if(search&&!imgObj.name.toLowerCase().includes(search))return;const div=document.createElement('div');div.className='photo';div.innerHTML=`<img src="${imgObj.src}" alt="${imgObj.name}"><div class="photo-name">${imgObj.name}</div>`;if(isAdmin){const del=document.createElement('button');del.className='delete-btn';del.innerHTML='&times;';del.onclick=()=>{if(confirm('ลบรูปนี้หรือไม่?')){data.categories[cat].splice(i,1);saveData();renderGallery();}};div.appendChild(del);}gallery.appendChild(div);});}

// Initial
loadCategories();
renderGallery();
