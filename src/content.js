console.log('Injected in Norns.ai')
console.log(window.location.href)

function hashHandler() {
  console.log('The hash has changed!');
}
// TODO: should match new - old 
window.addEventListener('hashchange', hashHandler, false);
window.onpopstate = function(event) {
  alert("location: " + document.location + ", state: " + JSON.stringify(event.state));
};