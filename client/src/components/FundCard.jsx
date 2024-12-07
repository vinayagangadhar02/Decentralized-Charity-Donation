import React, { useState } from 'react';
import { useContract } from '@/ContractContext/ContractContext';
import { ethers } from 'ethers';

const FundCard = ({ campaign, minContribution, campaignId, refreshCampaign, setOnFund }) => {
  const [donationAmount, setDonationAmount] = useState('');
  const { contract, signer, isOwner } = useContract();

  const handleDonate = async (e) => {
    e.preventDefault();

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      alert('Please enter a valid donation amount.');
      return;
    }

    if (parseFloat(donationAmount) < parseFloat(minContribution)) {
      alert(`Minimum contribution is ${minContribution} ETH.`);
      return;
    }

    try {
      const tx = await contract.fund(campaignId, { value: donationAmount });
      await tx.wait();
      alert('Donation successful!');
      setOnFund(true);
      setDonationAmount('');
      refreshCampaign();
    } catch (error) {
      if (donationAmount > minContribution) {
        console.log(donationAmount);
        console.log(minContribution);
        alert('Donation failed. The minimum amount payable is ', minContribution);
      } else {
        console.error('Donation failed:', error);
        alert('Donation failed. Please try again.');
      }
    }
  };

  const progressPercentage = campaign.goal > 0
    ? Math.min((parseFloat(campaign.balance) / parseFloat(campaign.goal)) * 100, 100)
    : 0;

  return (
    <div className="bg-purple-100 rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4 text-purple-600">FUND</h2>
      <div className="space-y-4">
        <div className="flex justify-between">
          <p className="text-sm">Days Left</p>
          <p className="text-purple-600">{campaign.daysLeft}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm">Raised</p>
          <p className="text-purple-600">
            {campaign.balance} of {campaign.goal} ETH
          </p>
        </div>
        <div className="w-full bg-purple-300 h-2 rounded-full mt-4">
          <div
            className="bg-purple-600 h-2 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-4">
          <p className="text-sm">Total Backers</p>
          <p className="text-purple-600">{campaign.noOfContributors}</p>
        </div>
        <div className="flex justify-between mt-2">
          <p className="text-sm">Minimum Contribution</p>
          <p className="text-purple-600">{minContribution} ETH</p>
        </div>
      </div>
      {!isOwner &&
        <form onSubmit={handleDonate} className="mt-6">
          <label className="block text-black-600 text-sm mb-2">
            Pledge without reward:
          </label>
          <input
            type="number"
            value={donationAmount}
            onChange={(e) => setDonationAmount(e.target.value)}
            className="w-full p-3 bg-white border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500"
            placeholder="Enter ETH amount"
            required
            min="0.01"
            step="0.01"
          />
          <p className="text-sm text-red-600 mt-2">
            {donationAmount < minContribution && donationAmount !== '' && `Minimum contribution is ${minContribution} ETH`}
          </p>
          <button
            type="submit"
            className={`mt-4 w-full py-3 rounded-md text-white font-medium ${'bg-purple-700 hover:bg-purple-600'}`}
          >
            Fund Campaign
          </button>
        </form>
      }
    </div>
  );
};

export default FundCard;
