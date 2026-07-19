// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// react-modal's setAppElement('#root') runs at import time and needs the element
const root = document.createElement('div');
root.setAttribute('id', 'root');
document.body.appendChild(root);
