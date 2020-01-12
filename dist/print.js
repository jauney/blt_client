const { ipcRenderer } = require('electron')
console.log(9999999999)
alert(44444)
ipcRenderer.on('webview-print-render', (event, deviceName, printHtml) => {
  console.log('收到', printHtml);
  //执行渲染
  let html = '';
  for (let index = 0; index < 5; index++) {
    html += `<div class="div1"><p id="time">${deviceName}hahahah</p> </div>`
  }
  document.getElementById('bd').innerHTML = html;
  ipcRenderer.sendToHost('webview-print-do')
})
