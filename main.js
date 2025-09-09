// Naive client-side partials loader (works on static hosting)
async function loadPartial(id, url){
  try{
    const res = await fetch(url);
    if(!res.ok) throw new Error(`Failed to fetch ${url}`);
    document.getElementById(id).innerHTML = await res.text();
  }catch(e){
    console.warn(e);
  }
}
document.addEventListener('DOMContentLoaded', () => {
  loadPartial('site-header','/partials/header.html');
  loadPartial('site-footer','/partials/footer.html');
});