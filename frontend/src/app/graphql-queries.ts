/**
 * GraphQL-Queries und Mutations für die Buch-API
 */

/**
 * Query zum Abrufen einer Liste von Büchern mit Suchparametern
 */
export const BUECHER_QUERY = `
  query Buecher($suchparameter: SuchparameterInput, $page: Int, $size: Int, $sort: String) {
    buecher(suchparameter: $suchparameter, page: $page, size: $size, sort: $sort) {
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
 * Query zum Abrufen ähnlicher Bücher (für Empfehlungen)
 * Lädt Bücher mit gleicher Art oder ähnlichen Schlagwörtern
 */
export const RELATED_BUECHER_QUERY = `
  query RelatedBuecher($suchparameter: SuchparameterInput, $size: Int) {
    buecher(suchparameter: $suchparameter, page: 1, size: $size) {
      content {
        id
        isbn
        rating
        art
        preis
        rabatt(short: false)
        titel {
          titel
          untertitel
        }
        schlagwoerter
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
