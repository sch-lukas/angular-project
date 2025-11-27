/**
 * GraphQL-Queries und Mutations für die Buch-API
 */

/**
 * Query zum Abrufen einer Liste von Büchern mit Suchparametern
 */
export const BUECHER_QUERY = `
  query Buecher($suchparameter: SuchparameterInput, $page: Int, $size: Int) {
    buecher(suchparameter: $suchparameter, page: $page, size: $size) {
      content {
        id
        isbn
        rating
        preis
        titel {
          titel
          untertitel
        }
      }
      page {
        size
        number
        totalElements
        totalPages
      }
    }
  }
`;

/**
 * Query zum Abrufen eines einzelnen Buchs per ID
 */
export const BUCH_BY_ID_QUERY = `
  query BuchById($id: ID!) {
    buch(id: $id) {
      id
      version
      isbn
      rating
      art
      preis
      rabatt(short: false)
      lieferbar
      datum
      homepage
      schlagwoerter
      titel {
        titel
        untertitel
      }
    }
  }
`;

/**
 * Mutation zum Erstellen eines neuen Buchs
 */
export const CREATE_BUCH_MUTATION = `
  mutation CreateBuch($input: BuchInput!) {
    create(input: $input) {
      id
    }
  }
`;
