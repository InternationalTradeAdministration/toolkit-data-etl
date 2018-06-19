require('../spec_helper')

const WebResourceCollector = require('../../lib/web_resource_collector')

describe('WebResourceCollector', () => {
  let collector, queryRelatedResourcesSpy, queryWebResourceLinksSpy

  beforeEach(() => {
    let assets = [
      {
        Product2: {
          Id: 'sfdc_product_1',
          Name: 'Product Name',
          Class__c: 'Product class 1'
        },
        Participant__r: {
          Id: 'sfdc_participant_1',
          Name: 'Same Name Different ID'
        }
      },
      {
        Product2: {
          Id: 'sfdc_product_2',
          Name: 'Product Name',
          Class__c: 'Product class 2'
        },
        Participant__r: {
          Id: 'sfdc_participant_2',
          Name: 'Same Name Different ID'
        }
      }
    ]

    collector = new WebResourceCollector(console, assets)

    let relatedResources = [
      {
        Product__c: 'sfdc_product_1',
        Primary_Web_Resource__c: 'sfdc_web_resource_1',
        Primary_Web_Resource__r: {
          Id: 'sfdc_web_resource_1',
          Name: 'Web Resource 1'
        },
        Related_Web_Resource__c: 'sfdc_related_web_resource_1',
        Related_Web_Resource__r: {
          Id: 'sfdc_related_web_resource_1',
          Name: 'Related Web Resource 1'
        }
      },
      {
        Product__c: 'sfdc_product_2',
        Primary_Web_Resource__c: 'sfdc_web_resource_2',
        Primary_Web_Resource__r: {
          Id: 'sfdc_web_resource_2',
          Name: 'Web Resource 2',
          Summary__c: 'Web Resource 2 Summary'
        }
      }
    ]

    queryRelatedResourcesSpy = jest.spyOn(collector, '_queryRelatedResources').mockImplementation(() => {
      return Promise.resolve(relatedResources)
    })

    let webResourceLinks = [
      {
        Id: 'web_resource_link_id_1',
        Web_Resource__c: 'sfdc_web_resource_1',
        DisplayName__c: 'Link 1',
        URL__c: 'https://example.org/link_1'
      },
      {
        Id: 'web_resource_link_id_2',
        Web_Resource__c: 'sfdc_web_resource_2',
        DisplayName__c: 'Link 2',
        URL__c: 'https://example.org/link_2'
      },
      {
        Id: 'web_resource_link_id_3',
        Web_Resource__c: 'sfdc_web_resource_2',
        DisplayName__c: 'Link 3',
        URL__c: 'https://example.org/link_3'
      },
      {
        Id: 'web_resource_link_id_4',
        Web_Resource__c: 'sfdc_related_web_resource_1',
        DisplayName__c: 'Link 4',
        URL__c: 'https://example.org/link_4'
      }
    ]

    queryWebResourceLinksSpy = jest.spyOn(collector, '_queryWebResourceLinks').mockImplementation(() => {
      return Promise.resolve(webResourceLinks)
    })
  })

  afterEach(() => {
    queryWebResourceLinksSpy.mockReset()
    queryWebResourceLinksSpy.mockRestore()
    queryRelatedResourcesSpy.mockReset()
    queryRelatedResourcesSpy.mockRestore()
  })

  describe('#extract', () => {
    it('returns WebResources by ProductId', () => {
      return collector.collect()
        .then(webResourcesByProductId => {
          expect(queryRelatedResourcesSpy).toHaveBeenCalledWith(['sfdc_product_1', 'sfdc_product_2'])
          expect(queryWebResourceLinksSpy).toHaveBeenCalledWith(['sfdc_web_resource_1', 'sfdc_web_resource_2', 'sfdc_related_web_resource_1'])

          let expectedWebResoucesByProductId = {
            sfdc_product_1: [
              {
                Id: 'sfdc_web_resource_1',
                Name: 'Web Resource 1',
                links: [
                  {
                    Id: 'web_resource_link_id_1',
                    Web_Resource__c: 'sfdc_web_resource_1',
                    DisplayName__c: 'Link 1',
                    URL__c: 'https://example.org/link_1'
                  }
                ]
              },
              {
                Id: 'sfdc_related_web_resource_1',
                Name: 'Related Web Resource 1',
                links: [
                  {
                    Id: 'web_resource_link_id_4',
                    Web_Resource__c: 'sfdc_related_web_resource_1',
                    DisplayName__c: 'Link 4',
                    URL__c: 'https://example.org/link_4'
                  }
                ]
              }
            ],
            sfdc_product_2: [
              {
                Id: 'sfdc_web_resource_2',
                Name: 'Web Resource 2',
                Summary__c: 'Web Resource 2 Summary',
                links: [
                  {
                    Id: 'web_resource_link_id_2',
                    Web_Resource__c: 'sfdc_web_resource_2',
                    DisplayName__c: 'Link 2',
                    URL__c: 'https://example.org/link_2'
                  },
                  {
                    Id: 'web_resource_link_id_3',
                    Web_Resource__c: 'sfdc_web_resource_2',
                    DisplayName__c: 'Link 3',
                    URL__c: 'https://example.org/link_3'
                  }
                ]
              }
            ]
          }
          expect(webResourcesByProductId).toEqual(expectedWebResoucesByProductId)
        })
    })
  })
})
