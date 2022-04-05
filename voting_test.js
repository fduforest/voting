const Voting = artifacts.require("Voting")
const { BN, expectRevert, expectEvent } = require("@openzeppelin/test-helpers")
const { expect } = require("chai")

contract("Voting", (accounts) => {
  const owner = accounts[0]
  const second = accounts[1]
  const third = accounts[2]
  const fourth = accounts[3]
  const fifth = accounts[4]
  let votingInstance

  // ::::::::::::: 1. Registering Voters Session Testing ::::::::::::: //

  describe.skip("1. Registering Voters Session Testing", () => {
    before(async () => {
      votingInstance = await Voting.new({ from: owner })
    })

    // Setters, Getters & Events Testing

    it("should Add & Return a single voter; Get event voter added", async () => {
      console.log("Add a single voter")
      const findEvent = await votingInstance.addVoter(owner, { from: owner })

      console.log("Get a single voter")
      const storedData = await votingInstance.getVoter(owner)
      expect(storedData.isRegistered).to.be.true

      console.log("Get event voter added")
      expectEvent(findEvent, "VoterRegistered", {
        voterAddress: owner,
      })
    })

    it("should Add & Return multiple voters", async () => {
      await votingInstance.addVoter(second, { from: owner })
      await votingInstance.addVoter(third, { from: owner })
      const secondVoter = await votingInstance.getVoter(second)
      const thirdVoter = await votingInstance.getVoter(third)
      expect(secondVoter.isRegistered).to.be.true
      expect(thirdVoter.isRegistered).to.be.true
    })

    // Requires Testing

    it("should Revert if we try to add a registered voter", async () => {
      await expectRevert(
        votingInstance.addVoter(owner, { from: owner }),
        "Already registered"
      )
    })

    it("should Revert if the caller is not the owner", async () => {
      await expectRevert(
        votingInstance.addVoter(second, { from: second }),
        "Ownable: caller is not the owner."
      )
    })

    it("should revert if getVoter() isn't called by a voter", async () => {
      await expectRevert(
        votingInstance.getVoter(owner, { from: fourth }),
        "You're not a voter"
      )
    })

    it("should Revert if the voters registration is not open yet", async () => {
      await votingInstance.startProposalsRegistering({ from: owner })
      await expectRevert(
        votingInstance.addVoter(fourth, { from: owner }),
        "Voters registration is not open yet"
      )
    })
  })

  // ::::::::::::: 2. Proposals Session Testing ::::::::::::: //

  describe("2. Proposals Session Testing", () => {
    before(async () => {
      votingInstance = await Voting.new({ from: owner })
      deployedVotingInstance = await Voting.new({ from: owner })
      await votingInstance.addVoter(owner, { from: owner })
      await votingInstance.addVoter(second, { from: owner })
      await votingInstance.addVoter(third, { from: owner })
    })

    // Proposal session starting testing

    it("should revert if startProposalsRegistering() isn't called by contract owner", async () => {
      await expectRevert(
        votingInstance.startProposalsRegistering({ from: second }),
        "Ownable: caller is not the owner."
      )
    })

    it("should start a proposal session", async () => {
      const findStartEvent = await votingInstance.startProposalsRegistering({
        from: owner,
      })
      expectEvent(findStartEvent, "WorkflowStatusChange", {
        previousStatus: Voting.WorkflowStatus.RegisteringVoters.toString(),
        newStatus:
          Voting.WorkflowStatus.ProposalsRegistrationStarted.toString(),
      })
    })

    // Setters, Getters & Events Testing

    it("should Add & Return a single proposal; Get event proposal added", async () => {
      console.log("Add a single proposal")
      const findEvent = await votingInstance.addProposal("Alyra", {
        from: owner,
      })

      console.log("Get a single proposal")
      const storedData = await votingInstance.getOneProposal(0)
      expect(storedData.description).to.equal("Alyra")

      console.log("Get event proposal added")
      expectEvent(findEvent, "ProposalRegistered", {
        proposalId: 0,
      })
    })

    it("should add & return multiple proposals", async () => {
      await votingInstance.addProposal("Bitcoin", { from: second })
      await votingInstance.addProposal("Ethereum", { from: third })
      const secondProposal = await votingInstance.getOneProposal(1)
      const thirdProposal = await votingInstance.getOneProposal(2)
      expect(secondProposal.description).to.equal("Bitcoin")
      expect(thirdProposal.description).to.equal("Ethereum")
    })

    // Setters, Getters Requires Testing

    it("should Revert if the caller is not a registered voter", async () => {
      await expectRevert(
        deployedVotingInstance.addProposal("Dogecoin", {
          from: fifth,
        }),
        "You're not a voter"
      )
    })

    it("should Revert if the proposal description is empty", async () => {
      await expectRevert(
        votingInstance.addProposal("", {
          from: owner,
        }),
        "Vous ne pouvez pas ne rien proposer"
      )
    })

    it("should revert if getOneProposal() isn't called by a voter", async () => {
      await expectRevert(
        deployedVotingInstance.getOneProposal(0, { from: owner }),
        "You're not a voter"
      )
    })

    // Proposal session ending testing

    it("should revert if endProposalsRegistering() isn't called by contract owner", async () => {
      await expectRevert(
        deployedVotingInstance.endProposalsRegistering({ from: second }),
        "Ownable: caller is not the owner."
      )
    })

    it("should end a proposal session & get the event", async () => {
      const findEndEvent = await votingInstance.endProposalsRegistering({
        from: owner,
      })
      expectEvent(findEndEvent, "WorkflowStatusChange", {
        previousStatus:
          Voting.WorkflowStatus.ProposalsRegistrationStarted.toString(),
        newStatus: Voting.WorkflowStatus.ProposalsRegistrationEnded.toString(),
      })
    })

    it("should Revert if the proposals registration is not open yet", async () => {
      await expectRevert(
        deployedVotingInstance.addProposal("Litecoin", {
          from: owner,
        }),
        "Proposals are not allowed yet"
      )
    })
  })

  // ::::::::::::: 3. Voting & tally Session Testing ::::::::::::: //

  describe.skip("3. Voting & Tally Session Testing", () => {
    before(async () => {
      votingInstance = await Voting.new({ from: owner })
      deployedVotingInstance = await Voting.deployed()
      await votingInstance.addVoter(owner, { from: owner })
      await votingInstance.addVoter(second, { from: owner })
      await votingInstance.addVoter(third, { from: owner })
      await votingInstance.addVoter(fourth, { from: owner })
      await votingInstance.startProposalsRegistering({
        from: owner,
      })
      await votingInstance.addProposal("Alyra", {
        from: owner,
      })
      await votingInstance.addProposal("Bitcoin", { from: second })
      await votingInstance.addProposal("Ethereum", { from: third })
      await votingInstance.endProposalsRegistering({
        from: owner,
      })
    })

    // Voting session starting testing

    it("should revert if startVotingSession() isn't called by contract owner", async () => {
      await expectRevert(
        votingInstance.startVotingSession({ from: second }),
        "Ownable: caller is not the owner."
      )
    })

    it("should start a voting session & get starting event", async () => {
      const findStartEvent = await votingInstance.startVotingSession({
        from: owner,
      })
      expectEvent(findStartEvent, "WorkflowStatusChange", {
        previousStatus:
          Voting.WorkflowStatus.ProposalsRegistrationEnded.toString(),
        newStatus: Voting.WorkflowStatus.VotingSessionStarted.toString(),
      })
    })

    // Setters, Getters & Events Testing

    it("should set vote for the second proposal & return proposal vote count and check if voter has voted ", async () => {
      await votingInstance.setVote(1, { from: owner })
      const storedData = await votingInstance.getOneProposal(1)
      expect(new BN(storedData.voteCount)).to.be.bignumber.equal(new BN(1))
    })

    it("should check if voter has voted and get the voted proposal id", async () => {
      const storedData = await votingInstance.getVoter(owner)
      expect(storedData.hasVoted).to.be.true
      expect(new BN(storedData.votedProposalId)).to.be.bignumber.equal(
        new BN(1)
      )
    })

    it("should set vote for another proposal from another voter & return proposal vote count", async () => {
      await votingInstance.setVote(2, { from: second })
      const storedData = await votingInstance.getOneProposal(2)
      expect(new BN(storedData.voteCount)).to.be.bignumber.equal(new BN(1))
    })

    it("should set another vote for the second proposal from another voter & return proposal vote count", async () => {
      await votingInstance.setVote(1, { from: third })
      const storedData = await votingInstance.getOneProposal(1)
      expect(new BN(storedData.voteCount)).to.be.bignumber.equal(new BN(2))
    })

    // Setters, Getters Requires Testing

    it("should revert if setVote() isn't called by a voter", async () => {
      await expectRevert(
        votingInstance.setVote(0, { from: fifth }),
        "You're not a voter"
      )
    })
    it("should revert if the voter has already voted", async () => {
      await expectRevert(
        votingInstance.setVote(0, { from: owner }),
        "You have already voted"
      )
    })

    // Voting session ending testing

    it("should revert if endVotingSession() isn't called by contract owner", async () => {
      await expectRevert(
        votingInstance.endVotingSession({ from: second }),
        "Ownable: caller is not the owner."
      )
    })

    it("should end a voting session", async () => {
      const findEndEvent = await votingInstance.endVotingSession({
        from: owner,
      })
      expectEvent(findEndEvent, "WorkflowStatusChange", {
        previousStatus: Voting.WorkflowStatus.VotingSessionStarted.toString(),
        newStatus: Voting.WorkflowStatus.VotingSessionEnded.toString(),
      })
    })

    it("should Revert if the voting session is ended or not started", async () => {
      await expectRevert(
        votingInstance.setVote(1, { from: fourth }),
        "Voting session havent started yet"
      )
    })

    // Tally session starting & ending

    it("should revert if tallyVotes() isn't called by contract owner", async () => {
      await expectRevert(
        votingInstance.tallyVotes({ from: second }),
        "Ownable: caller is not the owner."
      )
    })

    it("should tally the votes, get the winning proposal ID & get event", async () => {
      console.log("Tally the votes")
      const findEvent = await votingInstance.tallyVotes({ from: owner })
      console.log("Get winning proposal ID")
      const winningProposalID = await votingInstance.winningProposalID()
      expect(new BN(winningProposalID)).to.be.bignumber.equal(new BN(1))
      console.log("Get event")
      expectEvent(findEvent, "WorkflowStatusChange", {
        previousStatus: Voting.WorkflowStatus.VotingSessionEnded.toString(),
        newStatus: Voting.WorkflowStatus.VotesTallied.toString(),
      })
    })

    it("should Revert if current status is not voting session ended", async () => {
      await expectRevert(
        deployedVotingInstance.tallyVotes({ from: owner }),
        "Current status is not voting session ended"
      )
    })
  })
})
