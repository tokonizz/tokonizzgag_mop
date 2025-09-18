let cart = [];
let total = 0;
let discount = 0;

// 🎫 Voucher bawaan
let vouchers = {
  "DISKON10": {type:"percent", value:10, expiry:"2025-12-31", minSpend:100000},
  "DISKON50": {type:"fixed", value:50000, expiry:"2025-09-30", minSpend:200000}
};

// 🛒 Keranjang
function addToCart(name,price){
  cart.push({name,price});
  total+=price;
  renderCart();
}
function renderCart(){
  const list=document.getElementById("cart-items");
  list.innerHTML="";
  cart.forEach(item=>{
    let li=document.createElement("li");
    li.textContent=item.name+" - Rp"+item.price.toLocaleString();
    list.appendChild(li);
  });
  document.getElementById("cart-total").textContent=total.toLocaleString();
  updateFinalTotal();
}
function applyVoucher(){
  const code=document.getElementById("voucher").value.trim().toUpperCase();
  let msg=""; discount=0;
  if(vouchers[code]){
    const v=vouchers[code];
    const today=new Date(); const expiry=new Date(v.expiry);
    if(today<=expiry){
      if(total>=(v.minSpend||0)){
        if(v.type==="percent"){ discount=total*(v.value/100); msg=`Voucher ${code} berhasil! Diskon ${v.value}%`; }
        else if(v.type==="fixed"){ discount=v.value; msg=`Voucher ${code} berhasil! Potongan Rp${v.value.toLocaleString()}`; }
        else if(v.type==="special"){ discount=Math.min(total,v.value); msg=`Voucher ${code} berhasil! Gratis belanja max Rp${v.value.toLocaleString()}`; if(!v.used)v.used=0; v.used++; if(v.used>=v.maxUses){ delete vouchers[code]; msg+=" (Voucher sudah habis 2x pakai)"; } }
        document.getElementById("voucher-msg").style.color="green";
      } else { msg=`Minimal belanja Rp${v.minSpend.toLocaleString()}`; document.getElementById("voucher-msg").style.color="red"; }
    } else { msg=`Voucher ${code} sudah kadaluarsa`; document.getElementById("voucher-msg").style.color="red"; }
  } else if(code!==""){ msg="Kode voucher tidak valid!"; document.getElementById("voucher-msg").style.color="red"; }
  document.getElementById("voucher-msg").textContent=msg;
  updateFinalTotal();
}
function updateFinalTotal(){
  let final=total-discount; if(final<0)final=0;
  document.getElementById("final-total").textContent=final.toLocaleString();
}
function checkout(){
  if(cart.length===0){ alert("Keranjang kosong!"); return; }
  let final=total-discount; if(final<0)final=0;
  let message="Halo, saya mau pesan:\n";
  cart.forEach(i=>message+=`- ${i.name} Rp${i.price.toLocaleString()}\n`);
  if(discount>0)message+=`Diskon: Rp${discount.toLocaleString()}\n`;
  message+=`Total: Rp${final.toLocaleString()}`;
  let phone="6281234567890";
  window.open("https://wa.me/"+phone+"?text="+encodeURIComponent(message),"_blank");
}

// 🎡 Spin Harian
let spinning=false;
const spinPrizes=[
  {text:"Diskon 5%", type:"percent", value:5},
  {text:"Diskon 10%", type:"percent", value:10},
  {text:"Potongan Rp20.000", type:"fixed", value:20000},
  {text:"Zonk 😅", type:"none", value:0},
  {text:"Diskon 15%", type:"percent", value:15},
  {text:"🎁 Jackpot Gratis 2x (max 100rb)", type:"special", value:100000, maxUses:2}
];
function spin(){
  if(spinning)return; spinning=true;
  let lastSpin=localStorage.getItem("lastSpin"); let today=new Date().toDateString();
  if(lastSpin===today){ document.getElementById("result").textContent="Kamu sudah spin hari ini!"; spinning=false; return; }
  let jackpot=Math.random()*100<0.5; let prizeIndex=jackpot?5:Math.floor(Math.random()*spinPrizes.length);
  let deg=(360*5)+(prizeIndex*60)+(Math.random()*30-15);
  document.getElementById("wheel").style.transform=`rotate(${deg}deg)`;
  setTimeout(()=>{
    let prize=spinPrizes[prizeIndex];
    let msg=`Hasil spin: ${prize.text}`;
    document.getElementById("result").textContent=msg;
    if(prize.type!=="none"){
      let code="SPIN"+Date.now();
      vouchers[code]={type:prize.type,value:prize.value,expiry:today,minSpend:0,maxUses:prize.maxUses||1};
      msg+=`\nVoucher: ${code} (hari ini)`;
      document.getElementById("result").textContent=msg;
    }
    localStorage.setItem("lastSpin",today);
    spinning=false;
  },4000);
}

// 📅 Absen Harian
function absenHariIni(){
  let last=localStorage.getItem("lastAbsen"); let today=new Date().toDateString();
  if(last===today){ document.getElementById("absen-result").textContent="Kamu sudah absen hari ini!"; return; }
  let streak=parseInt(localStorage.getItem("streak")||"0")+1;
  localStorage.setItem("streak",streak);
  localStorage.setItem("lastAbsen",today);
  let code="ABSEN"+Date.now();
  vouchers[code]={type:"fixed",value:5000,expiry:today,minSpend:0};
  document.getElementById("absen-result").textContent=`Absen berhasil! Streak ${streak} hari 🎉\nVoucher Rp5.000 kode: ${code} (hari ini)`;
}

// 🔑 Password owner (ganti sesuai keinginanmu)
const OWNER_PASSWORD = "admin123";

function ownerLogin(){
  let pass=document.getElementById("owner-pass").value;
  if(pass===OWNER_PASSWORD){
    document.getElementById("owner-login").style.display="none";
    document.getElementById("owner-panel").style.display="block";
    document.getElementById("owner-msg").textContent="";
  } else {
    document.getElementById("owner-msg").textContent="Password salah!";
  }
}

function showVouchers(){
  let txt="Daftar Voucher Aktif:\n";
  for(let code in vouchers){
    let v=vouchers[code];
    txt+=`${code} → ${v.type} ${v.value} (exp: ${v.expiry})\n`;
  }
  document.getElementById("voucher-list").textContent=txt;
}

function resetSpin(){
  localStorage.removeItem("lastSpin");
  alert("Spin harian semua user direset!");
}

function resetAbsen(){
  localStorage.removeItem("lastAbsen");
  localStorage.removeItem("streak");
  alert("Absen harian semua user direset!");
}

function addVoucher(){
  let code=document.getElementById("new-code").value.trim().toUpperCase();
  let value=parseInt(document.getElementById("new-value").value);
  let type=document.getElementById("new-type").value;
  if(code && value>0){
    vouchers[code]={type:type,value:value,expiry:"2025-12-31",minSpend:0};
    alert(`Voucher ${code} ditambahkan!`);
    showVouchers();
  } else {
    alert("Isi kode & nilai voucher dulu!");
  }
      }
