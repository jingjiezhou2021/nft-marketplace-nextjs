import { graphql } from '@/apollo/gql';
const updateCollectionInfo = graphql(`
	mutation CustomUpdateCollectionInfo(
		$where: CustomUpdateCollectionInfoWhere!
		$data: CustomUpdateCollectionInfoData!
	) {
		customUpdateCollectionInfo(
			NewCollectionInfoData: { where: $where, data: $data }
		) {
			address
			id
			avatar
			banner
			category
			chainId
			createdAt
			description
			nickname
			url
		}
	}
`);
export default updateCollectionInfo;
