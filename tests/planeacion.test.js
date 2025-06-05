const { JSDOM } = require('jsdom');

function loadModule(html) {
  const dom = new JSDOM(html);
  global.window = dom.window;
  global.document = dom.window.document;
  global.alert = jest.fn();
  jest.resetModules();
  return require('../js/planeacion.js');
}

describe('validateForm', () => {
  afterEach(() => {
    delete global.window;
    delete global.document;
    delete global.alert;
  });

  test('ignores non-required fields', () => {
    const { validateForm } = loadModule(`
      <div class="tab">
        <input type="text" name="opt">
        <input type="text" name="req" required>
      </div>
    `);
    const tab = document.querySelector('.tab');
    const inputs = tab.querySelectorAll('input');
    inputs[1].value = 'filled';
    expect(validateForm(0)).toBe(true);
  });

  test('fails when required field empty', () => {
    const { validateForm } = loadModule(`
      <div class="tab">
        <input type="text" name="opt">
        <input type="text" name="req" required>
      </div>
    `);
    expect(validateForm(0)).toBe(false);
  });
});
