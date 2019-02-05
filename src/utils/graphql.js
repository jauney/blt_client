import ApolloClient from 'apollo-boost';
import gql from 'graphql-tag';
const client = new ApolloClient({
  uri: 'http://127.0.0.1:3002/graphql',
});

export default function graphqlQuery() {
  return client
    .query({
      query: gql`
        query getCustomers($pageNo: Int, $pageSize: Int, $filter: CustomerInput, $type: Int) {
          getCustomers(pageNo: $pageNo, pageSize: $pageSize, filter: $filter, type: $type) {
            total
            customers {
              customer_id
              customer_name
            }
          }
        }
      `,
      variables: {
        pageNo: 1,
        pageSize: 20,
        filter: { customer_id: 1 },
        type: 2,
      },
    })
    .then(data => {
      console.log(data);
      return data;
    })
    .catch(error => {
      console.error(error);
      return { code: 9999, msg: '网络异常，请稍后再试' };
    });
}
