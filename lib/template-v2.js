exports.fileExt = 'ts'
exports.tpl = {
  class: `import { FetchService } from '@/utils';
  /**
   * {{&description}}
   * @class {{&className}}
   */
  export default class {
      public http: FetchService;
      public constructor(http:FetchService) {
        this.http = http;
      }
  
  {{#methods}}
      {{> method}}
  {{/methods}}
  }
  `,
  dts: `declare namespace {{moduleName}} {
    {{#definitions}}
      {{#isMapObject}}
        interface {{&name}} {[elem:string]:any}
      {{/isMapObject}}
      {{^isMapObject}}
        interface {{&name}} {{#tsType}}{{> type}}{{/tsType}}
      {{/isMapObject}}
    {{/definitions}}

      interface ServiceAuto {
    {{#methods}}
      {{> method}}
    {{/methods}}
      }
    }`,
  dtsMethod: `
    /**
     * {{&summary}}
     * @method
     {{#externalDocs}}
      * @see {@link {{&url}}|{{#description}}{{&description}}{{/description}}{{^description}}External docs{{/description}}}
      {{/externalDocs}}
      */
    {{&actionName}} ( {{#parameters}}{{#isQueryParameter}}{{safeName}}:{{#tsType}}{{> type}}{{/tsType}},{{/isQueryParameter}}{{#isBodyParameter}}{{safeName}}:{{#tsType}}{{> type}}{{/tsType}},{{/isBodyParameter}}{{#isPathParameter}}{{safeName}}:{{#tsType}}{{> type}}{{/tsType}},{{/isPathParameter}}{{/parameters}} ):Promise< {{#responses}}{{#status200}}{{#tsType}}{{> type}}{{/tsType}}{{/status200}}{{/responses}} >;
  `,
  method: `/**
  * {{&summary}}
  * @method
  {{#externalDocs}}
  * @see {@link {{&url}}|{{#description}}{{&description}}{{/description}}{{^description}}External docs{{/description}}}
  {{/externalDocs}}
  */
  public async {{&actionName}} ( {{#parameters}}{{#isQueryParameter}}{{safeName}}:{{#tsType}}{{> type}}{{/tsType}},{{/isQueryParameter}}{{#isBodyParameter}}{{safeName}}:{{#tsType}}{{> type}}{{/tsType}},{{/isBodyParameter}}{{#isPathParameter}}{{safeName}}:{{#tsType}}{{> type}}{{/tsType}},{{/isPathParameter}}{{/parameters}} ):Promise< {{#responses}}{{#status200}}{{#tsType}}{{> type}}{{/tsType}}{{/status200}}{{/responses}} > {
    const result: {{#responses}}{{#status200}}{{#tsType}}{{> type}}{{/tsType}}{{/status200}}{{/responses}} = await this.http.request({method:"{{method}}", url:"{{{path}}}", params:{ {{#parameters}}{{#isQueryParameter}}{{/isQueryParameter}}{{#isQueryParameter}}{{safeName}},{{/isQueryParameter}}{{/parameters}} }, payload:{ {{#parameters}} {{#isBodyParameter}} ...{{safeName}},{{/isBodyParameter}} {{/parameters}} } } );
    return result;
  }
  `,
  methodType: `{{#tsType}}
  {{! must use different delimiters to avoid ambiguities when delimiters directly follow a literal brace {. }}
  {{=<% %>=}}
  <%#isRef%><%moduleName%>.<%&target%><%/isRef%><%!
  %><%#isAtomic%><%&tsType%><%/isAtomic%><%!
  %><%#isObject%>{<%#properties%>
  '<%name%>'<%#optional%>?<%/optional%>: <%>type%><%/properties%>
  }<%/isObject%><%!
  %><%#isArray%>Array<<%#elementType%><%>type%><%/elementType%>><%/isArray%>
  <%={{ }}=%>
  {{/tsType}}`,
  classMock: `// eslint-disable-next-line @typescript-eslint/no-var-requires
  const mockJSON = require('./services.mockData.json');
  /**
   * {{&description}}
   * @class {{&className}}
   * @param {(string)} [domainOrOptions] - The project domain.
   */
  export default class {
      public http: any;
      public constructor(http:any) {
        console.log(http)
      }
  
  {{#methods}}
      {{> method}}
  {{/methods}}
  }
  `,
  methodMock: `/**
  * {{&summary}}
  * @method
  {{#externalDocs}}
  * @see {@link {{&url}}|{{#description}}{{&description}}{{/description}}{{^description}}External docs{{/description}}}
  {{/externalDocs}}
  */
  public async {{&actionName}} ( {{#parameters}}{{#isQueryParameter}}{{safeName}}:{{#tsType}}{{> type}}{{/tsType}},{{/isQueryParameter}}{{#isBodyParameter}}{{safeName}}:{{#tsType}}{{> type}}{{/tsType}},{{/isBodyParameter}}{{#isPathParameter}}{{safeName}}:{{#tsType}}{{> type}}{{/tsType}},{{/isPathParameter}}{{/parameters}} ):Promise< {{#responses}}{{#status200}}{{#tsType}}{{> type}}{{/tsType}}{{/status200}}{{/responses}} > {
      return mockJSON.{{&actionName}};
  }`,
  type: `{{#tsType}}
  {{! must use different delimiters to avoid ambiguities when delimiters directly follow a literal brace {. }}
  {{=<% %>=}}
  <%#isRef%><%&target%><%/isRef%><%!
  %><%#isAtomic%><%&tsType%><%/isAtomic%><%!
  %><%#isObject%>{<%#properties%>
  <%#description%>/**
    * <%&description%>
    */
  <%/description%>
  '<%name%>'<%#optional%>?<%/optional%>: <%>type%><%/properties%>
  }<%/isObject%><%!
  %><%#isArray%>Array<<%#elementType%><%>type%><%/elementType%>><%/isArray%>
  <%={{ }}=%>
  {{/tsType}}`,
  unittest: `import ServiceAuto from '@/services{{{moduleLowercase}}}/services.auto';
  import params from './services.auto.spec.params'
  import Http from '@/utils/axios'
  let services = new ServiceAuto(new Http(process.env.VUE_APP_API{{moduleUPEPRCASE}}));
  
  {{#methods}}
  test('{{actionName}}', async () => {
    {{#parameters}}
      {{#isQueryParameter}}
        const {{safeName}}:{{#tsType}}{{> type}}{{/tsType}} = params.{{actionName}}.{{safeName}};
      {{/isQueryParameter}}
      {{#isBodyParameter}}
        {{#tsType}}
          {{#isPageRequest}}
            const {{safeName}}: {{#tsType}}{{> type}}{{/tsType}} = params.{{actionName}}.{{safeName}}
          {{/isPageRequest}}
          {{^isPageRequest}}
            const {{safeName}}:{{#tsType}}{{> type}}{{/tsType}} = params.{{actionName}}.{{safeName}};
          {{/isPageRequest}}
        {{/tsType}}
      {{/isBodyParameter}}
    {{/parameters}}
  
    const result = await services.{{actionName}}({{#parameters}}{{#isQueryParameter}}{{safeName}},{{/isQueryParameter}}{{#isBodyParameter}}{{safeName}},{{/isBodyParameter}}{{/parameters}})
  
    {{#responses}}
      {{#status200}}
        {{#tsType}}
          {{#isArray}}
            expect(result).toEqual(expect.any(Array));
          {{/isArray}}
          {{#isObject}}
            expect(result).toBeDefined();
          {{/isObject}}
          {{#isRef}}
            expect(result.code).toEqual(expect.stringMatching(/^000000$|^400$/))
          {{/isRef}}
          {{#isAtomic}}
            expect(result).toBeDefined();
          {{/isAtomic}}
        {{/tsType}}
      {{/status200}}
    {{/responses}}
  })
  {{/methods}}
  `,
  unittestType: `{{#tsType}}
  {{! must use different delimiters to avoid ambiguities when delimiters directly follow a literal brace {. }}
  {{=<% %>=}}
  <%#isRef%><%moduleName%>.<%&target%><%/isRef%><%!
  %><%#isAtomic%><%&tsType%><%/isAtomic%><%!
  %><%#isObject%>{<%#properties%>
  '<%name%>'<%#optional%>?<%/optional%>: <%>type%><%/properties%>
  }<%/isObject%><%!
  %><%#isArray%>Array<<%#elementType%><%>type%><%/elementType%>><%/isArray%>
  <%={{ }}=%>
  {{/tsType}}`,
  unittestParams: `export default {
    {{#methods}}
      {{actionName}}:{
        {{#parameters}}
          {{#isQueryParameter}}
            {{safeName}}:undefined,
          {{/isQueryParameter}}
          {{#isBodyParameter}}
            {{#tsType}}
              {{#isPageRequest}}
                {{safeName}}: {
                  query: {},
                  page: { page_index: 0, page_size: 10 },
                },
              {{/isPageRequest}}
              {{^isPageRequest}}
                {{safeName}}:undefined,
              {{/isPageRequest}}
            {{/tsType}}
          {{/isBodyParameter}}
        {{/parameters}}
      },
    {{/methods}}
  }`
};
