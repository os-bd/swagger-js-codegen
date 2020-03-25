# Swagger to JS & Typescript Codegen

## 运行

1、 npm install

2、 swagger JSON 访问，如：

- https://xxxxx/portal/api/v2/api-docs

notice: the symbol « » replaced with \$ in the definition.json

3、 a. 通过 vscode 调试即可立即生成结果。（可断点调试）

3、 b. 也可以通过命令生成

```
npm run build-portal
```

4、文件将被生成至目录下 /src/:

- typing.d.ts => 项目 src/typing.d.ts
- services.auto.ts => 项目 src/services/services.auto.ts
- services.mock.ts => 项目 src/services/services.mock.ts
- services.mockData.json => 项目 src/services/services.mockData.json
- services.auto.spec.ts => 项目 tests/unit/services.auto.spec.ts
- services.auto.spec.params.ts => 项目 tests/unit/services.auto.spec.params.ts。 该文件用于手动修改测试变量，生成后不建议再修改

## Specifying custom Chance options

Swagger specifies only a few primitive types; for scenarios where specific chance methods are needed, use the `x-chance-type` field.

```yaml
---
definitions:
  NewPet:
    properties:
      name:
        type: string
        x-chance-type: name
      tag:
        type: string
        x-chance-type: guid
```

Most of the chance methods allow some fine-tuning of the returned data. For example, the [integer](http://chancejs.com/#integer) method allows specification of minimum and maximum output values. These options can be configured in the Swagger YAML file with the `x-chance-options` block:

```yaml
---
definitions:
  Pet:
    allOf:
      - $ref: "#/definitions/NewPet"
      - required:
          - id
        properties:
          id:
            type: integer
            format: int64
            x-type-options:
              min: 1
              max: 1000
```

## A note on types:

All of the primitive types defined in the [Swagger specification](https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md#data-types) are supported except for `file` and `password`. Currently, the `format` property is ignored; use `x-chance-type` instead. The server will error on any request with a type other than one of the primitive types if there is no valid x-chance-type also defined.

### Returning Fixed Values

Although not a chance method, support has been added for returning fixed values using `x-chance-type: fixed`. Any value given for the custom tag `x-type-value` will be returned; below is an example where an object is returned:

```yaml
status:
  type: object
  x-chance-type: fixed
  x-type-value:
    type: "adopted"
```

## Custom template

```javascript
var source = CodeGen.getCustomCode({
  moduleName: "Test",
  className: "Test",
  swagger: swaggerSpec,
  template: {
    class: fs.readFileSync("my-class.mustache", "utf-8"),
    method: fs.readFileSync("my-method.mustache", "utf-8"),
    type: fs.readFileSync("my-type.mustache", "utf-8")
  }
});
```

## Options

In addition to the common options listed below, `getCustomCode()` _requires_ a `template` field:

    template: { class: "...", method: "..." }

`getAngularCode()`, `getNodeCode()`, and `getCustomCode()` each support the following options:

```yaml
moduleName:
  type: string
  description: Your AngularJS module name
className:
  type: string
lint:
  type: boolean
  description: whether or not to run jslint on the generated code
esnext:
  type: boolean
  description: passed through to jslint
beautify:
  type: boolean
  description: whether or not to beautify the generated code
mustache:
  type: object
  description: See the 'Custom Mustache Variables' section below
imports:
  type: array
  description: Typescript definition files to be imported.
swagger:
  type: object
  required: true
  description: swagger object
```

### Template Variables

The following data are passed to the [mustache templates](https://github.com/janl/mustache.js):

```yaml
isNode:
  type: boolean
isES6:
  type: boolean
description:
  type: string
  description: Provided by your options field: 'swagger.info.description'
isSecure:
  type: boolean
  description: false unless 'swagger.securityDefinitions' is defined
moduleName:
  type: string
  description: Your AngularJS module name - provided by your options field
className:
  type: string
  description: Provided by your options field
domain:
  type: string
  description: If all options defined: swagger.schemes[0] + '://' + swagger.host + swagger.basePath
methods:
  type: array
  items:
    type: object
    properties:
      path:
        type: string
      className:
        type: string
        description: Provided by your options field
      methodName:
        type: string
        description: Generated from the HTTP method and path elements or 'x-swagger-js-method-name' field
      method:
        type: string
        description: 'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'COPY', 'HEAD', 'OPTIONS', 'LINK', 'UNLIK', 'PURGE', 'LOCK', 'UNLOCK', 'PROPFIND'
        enum:
        - GET
        - POST
        - PUT
        - DELETE
        - PATCH
        - COPY
        - HEAD
        - OPTIONS
        - LINK
        - UNLIK
        - PURGE
        - LOCK
        - UNLOCK
        - PROPFIND
      isGET:
        type: string
        description: true if method === 'GET'
      summary:
        type: string
        description: Provided by the 'description' or 'summary' field in the schema
      externalDocs:
        type: object
        properties:
          url:
            type: string
            description: The URL for the target documentation. Value MUST be in the format of a URL.
            required: true
          description:
            type: string
            description: A short description of the target documentation. GitHub-Markdown syntax can be used for rich text representation.
      isSecure:
        type: boolean
        description: true if the 'security' is defined for the method in the schema
      parameters:
        type: array
        description: Includes all of the properties defined for the parameter in the schema plus:
        items:
          camelCaseName:
            type: string
          isSingleton:
            type: boolean
            description: true if there was only one 'enum' defined for the parameter
          singleton:
            type: string
            description: the one and only 'enum' defined for the parameter (if there is only one)
          isBodyParameter:
            type: boolean
          isPathParameter:
            type: boolean
          isQueryParameter:
            type: boolean
          isPatternType:
            type: boolean
            description: true if *in* is 'query', and 'pattern' is defined
          isHeaderParameter:
            type: boolean
          isFormParameter:
            type: boolean
```

#### Custom Mustache Variables

You can also pass in your own variables for the mustache templates by adding a `mustache` object:

```javascript
var source = CodeGen.getCustomCode({
    ...
    mustache: {
      foo: 'bar',
      app_build_id: env.BUILD_ID,
      app_version: pkg.version
    }
});
```

## Swagger Extensions

### x-proxy-header

Some proxies and application servers inject HTTP headers into the requests. Server-side code
may use these fields, but they are not required in the client API.

eg: https://cloud.google.com/appengine/docs/go/requests#Go_Request_headers

```yaml
  /locations:
    get:
      parameters:
      - name: X-AppEngine-Country
        in: header
        x-proxy-header: true
        type: string
        description: Provided by AppEngine eg - US, AU, GB
      - name: country
        in: query
        type: string
        description: |
          2 character country code.
          If not specified, will default to the country provided in the X-AppEngine-Country header
      ...
```
