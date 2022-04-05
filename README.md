# Alyra Test Voting

## Unit tests

30 tests valides

Toutes les fonctions du contrat sont testées

1 file: voting_test.js

### 1) Registering Voters Session Testing

- should Add & Return a single voter; Get event voter added
- should Add & Return multiple voters
- should Revert if we try to add a registered voter
- should Revert if the caller is not the owner
- should revert if getVoter() isn't called by a voter
- should Revert if the voters registration is not open yet

### 2) Proposals Session Testing

- should revert if startProposalsRegistering() isn't called by contract owner
- should start a proposal session
- should Add & Return a single proposal; Get event proposal added
- should add & return multiple proposals
- should Revert if the caller is not a registered voter
- should Revert if the proposal description is empty
- should revert if getOneProposal() isn't called by a voter
- should revert if endProposalsRegistering() isn't called by contract owner
- should end a proposal session & get the event
- should Revert if the proposals registration is not open yet

### 3) Voting & Tally Session Testing

- should revert if startVotingSession() isn't called by contract owner
- should start a voting session & get starting event
- should set vote for the second proposal & return proposal vote count and check if voter has voted
- should check if voter has voted and get the voted proposal id
- should set vote for another proposal from another voter & return proposal vote count
- should set another vote for the second proposal from another voter & return proposal vote count
- should revert if setVote() isn't called by a voter
- should revert if the voter has already voted
- should revert if endVotingSession() isn't called by contract owner
- should end a voting session
- should Revert if the voting session is ended or not started
- should revert if tallyVotes() isn't called by contract owner
- should tally the votes, get the winning proposal ID & get event
- should Revert if current status is not voting session ended
