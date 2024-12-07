import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useContract } from '@/ContractContext/ContractContext';
import handleLogOut from '@/components/handleLogOut';
import FundCard from '@/components/FundCard';
import VoteCard from '@/components/VoteCard';
import TitleCard from '@/components/TitleCard'; 


const ViewCampaign = () => {
  const { id } = useParams();
  const [basicDetails, setBasicDetails] = useState(null);
  const [financialDetails, setFinancialDetails] = useState(null);
  const [contributors, setContributors] = useState([]);
  const [ownerDetails, setOwnerDetails] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onFund, setOnFund] = useState(false);

  const { contract } = useContract();

  const handleVote = async (campaignId) => {
    try {
      await contract.voteForCampaign(campaignId);
    } catch (error) {
      console.error('Voting error:', error);
    }
  };

  const handleDonate = async (amountInWei) => {
    try {
      await contract.donateToCampaign(id, { value: amountInWei });
      alert('Thank you for your donation!');
    } catch (error) {
      console.error('Donation failed:', error);
      alert('Donation failed. Please try again.');
    }
  };

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        setIsLoading(true);
        const fetchedBasicDetails = await contract.getCampaignBasicDetails(id);
        const fetchedFinancialDetails = await contract.getCampaignFinancialDetails(id);
        const fetchedContributors = await contract.getContributorsForCampaign(id);
        const fetchedOwnerDetails = await contract.getOwner(fetchedBasicDetails.owner);

        setBasicDetails({
          id: fetchedBasicDetails.id.toString(),
          title: fetchedBasicDetails.title,
          description: fetchedBasicDetails.description,
          creatorAddress: fetchedBasicDetails.owner,
          minContribution: fetchedBasicDetails.minContribution,
        });

        setFinancialDetails({
          goal: parseFloat(fetchedFinancialDetails.goal),
          balance: parseFloat(fetchedFinancialDetails.balance),
          noOfContributors: fetchedFinancialDetails.noOfContributors,
          daysLeft: fetchedFinancialDetails.daysLeft,
        });

        setContributors(fetchedContributors);
        setOwnerDetails({
          address: fetchedOwnerDetails.owner,
          name: fetchedOwnerDetails.ownerName,
          verified: fetchedOwnerDetails.verified,
        });
      } catch (err) {
        setError('Error fetching campaign details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaignDetails();
  }, [id, contract, onFund]);

  if (isLoading) return <p className="text-center text-purple-700 mt-20">Loading...</p>;
  if (error) return <p className="text-center text-red-600 mt-20">{error}</p>;

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md flex items-center justify-between px-6 py-2" style={{ height: '50px' }}>
        <h1 className="text-xl font-bold text-purple-600">Campaign Portal</h1>
        <button
          onClick={handleLogOut}
          className="text-sm text-purple-600 font-semibold py-2 px-4 rounded-md hover:bg-purple-200"
        >
          Logout
        </button>
      </div>
      <div className="my-10 border-l-[50px] border-r-[50px] border-purple-200">
        <div className="my-10 max-w-5xl mx-auto py-10 px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <TitleCard
                basicDetails={basicDetails}
                ownerDetails={ownerDetails}
                contributors={contributors}
              />
            </div>
            <div>
              <FundCard
                campaign={financialDetails}
                minContribution={basicDetails?.minContribution}
                campaignId={basicDetails?.id}
                refreshCampaign={() => {}}
                setOnFund={setOnFund}
              />
              <VoteCard campaignId={basicDetails?.id} onVote={handleVote} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCampaign;
