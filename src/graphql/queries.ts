import type { Operation } from '../sdk/request'

export const VREIN_PRODUCTS_QUERY: Operation = {
  __meta__: {
    operationName: 'VreinProductsQuery',
  },
  query: `
    query VreinProductsQuery($sectionId: String!, $context: String) {
      vreinProducts(sectionId: $sectionId, context: $context) {
        products {
          id
          sku
          slug
          name
          brand {
            name
          }
          image {
            url
            alternateName
          }
          offers {
            offers {
              price
              listPrice
              availability
            }
          }
          isVariantOf {
            productGroupID
            name
          }
        }
        totalCount
        title
        endpointName
        apiUrl
      }
    }
  `,
}

export const VREIN_IMAGES_QUERY: Operation = {
  __meta__: {
    operationName: 'VreinImagesQuery',
  },
  query: `
    query VreinImagesQuery(
      $sectionId: String!
      $email: String
      $categoryId: String
      $whitelabel: String
      $sessionGuid: String
    ) {
      vreinImages(
        sectionId: $sectionId
        email: $email
        categoryId: $categoryId
        whitelabel: $whitelabel
        sessionGuid: $sessionGuid
      ) {
        images {
          title
          image
          mobileImage
          link
        }
        smartCountdown {
          dateStart
          dateEnd
          fontSizeDesktop
          fontSizeMobile
          positionDesktop
          positionMobile
          fontColor
          enabled
          timeZoneOffset
        }
      }
    }
  `,
}
