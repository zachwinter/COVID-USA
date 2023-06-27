const fallback = (text: string) => {
  const isIos: any = navigator.userAgent.match(/ipad|iphone/i);
  const textarea: any = document.createElement('textarea');
  textarea.value = text;
  textarea.style.fontSize = '20px';
  textarea.style.position = 'fixed';
  textarea.style.zIndex = '-1';
  document.body.appendChild(textarea);
  if (isIos) {
    const range: any = document.createRange();
    range.selectNodeContents(textarea);
    const selection: any = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    textarea.setSelectionRange(0, 999999);
  } else {
    textarea.select();
  }
  document.execCommand('copy');
  document.body.removeChild(textarea);
};

export function copyToClipboard(text: string) {
  if (!navigator.clipboard) {
    fallback(text);
    return;
  }

  navigator.clipboard.writeText(text);
}
