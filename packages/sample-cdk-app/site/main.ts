
window.addEventListener('load', () => {
  const button = document.getElementById('test');
  const result = document.getElementById('test-result');
  if (button && result) {
    button.onclick = async () => {
      result.innerText = 'loading';
      const res = await fetch('/api/hello')
      result.innerText = await res.text();
    };
  }
});