/** 
    very simply js to capture mouse position 
    and set variables to the % location. Everything else is css/svg.
**/
function moveBg(e) {
    const rect = e.target.getBoundingClientRect();
    e.target.style.setProperty('--x', (e.clientX - rect.x) / rect.width * 100);
    e.target.style.setProperty('--y', (e.clientY - rect.y) / rect.height * 100);
}
document.querySelector("button").addEventListener('pointermove', moveBg);