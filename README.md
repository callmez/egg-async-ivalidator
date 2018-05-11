# egg-async-validate

Validate plugin for egg, compatible [egg-validate](https://github.com/eggjs/egg-validate) method.

see [async-validate](https://github.com/yiminghe/async-validator) for more information such as custom rule.

## Install

```bash
$ npm i egg-ivalidate --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.validate = {
  enable: true,
  package: 'egg-ivalidate',
};
```

## Configuration

```js
// {app_root}/config/config.default.js
exports.validate = {
  messages: {},
};
```

see [async-validator#messages](https://github.com/yiminghe/async-validator#messages) for more detail.

## Example

```js
// {app_root}/app/controller/home.js
exports.index = async ctx => {

  // will throw if invalid.
  await ctx.validate({
    data: { type: 'object', required: true },
  }, {
    data: '1',
  });

  // if you want to get errors info,
  // use try { ... } catch (err) { ... } to get
  // example
  try {
    await ctx.validate({ data: { type: 'object', required: true } }); // validate target, default to `this.request.body`
  } catch (err) {
    const errors = err.errors;
  }

};
```
rules see [async-validator#rules](https://github.com/yiminghe/async-validator#rules) for more detail.

> !!important:  `method`,`date`,`hex` in `type` does not apply to server - side form validation

## License

[MIT](LICENSE)
