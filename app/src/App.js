import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import deploy from './deploy';
import Escrow from './Escrow'; // Import the Escrow contract ABI

const provider = new ethers.providers.Web3Provider(window.ethereum);

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

function App() {
  const [escrows, setEscrows] = useState([]);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();
  const [escrowHistory, setEscrowHistory] = useState([]);

  useEffect(() => {
    async function getAccounts() {
      const accounts = await provider.send('eth_requestAccounts', []);
      setAccount(accounts[0]);
      setSigner(provider.getSigner());
    }

    getAccounts();
  }, [account]);

  useEffect(() => {
    if (escrows.length > 0) {
      loadEscrowHistory();
    }
  }, [escrows]);

  const loadEscrowHistory = async () => {
    const allHistory = [];

    for (const escrow of escrows) {
      const escrowContract = new ethers.Contract(escrow.address, Escrow.abi, provider);
      const historyCount = await escrowContract.counter();

      for (let i = 0; i < historyCount; i++) {
        const entry = await escrowContract.escrowHistory(i);
        allHistory.push({
          contractAddress: escrow.address,
          arbiter: entry.arbiter,
          depositor: entry.depositor,
          beneficiary: entry.beneficiary,
          balance: ethers.utils.formatEther(entry.balance),
        });
      }
    }

    setEscrowHistory(allHistory);
  };

  async function newContract() {
    const beneficiary = document.getElementById('beneficiary').value;
    const arbiter = document.getElementById('arbiter').value;
    const valueInEther = document.getElementById('ether').value;
    const value = ethers.utils.parseEther(valueInEther);
    
    const escrowContract = await deploy(signer, arbiter, beneficiary, value);

    const escrow = {
      address: escrowContract.address,
      arbiter,
      beneficiary,
      value: valueInEther.toString(),
      handleApprove: async () => {
        escrowContract.on('Approved', () => {
          document.getElementById(escrowContract.address).className = 'complete';
          document.getElementById(escrowContract.address).innerText = "✓ It's been approved!";
        });

        await approve(escrowContract, signer);
      },
    };

    setEscrows([...escrows, escrow]);
  }

  return (
    <>
      <div className="contract">
        <h1> New Contract </h1>
        <label>
          Arbiter Address
          <input type="text" id="arbiter" />
        </label>
        <label>
          Beneficiary Address
          <input type="text" id="beneficiary" />
        </label>
        <label>
          Deposit Amount (in Eth)
          <input type="text" id="ether" />
        </label>
        <div className="button" id="deploy" onClick={(e) => {
            e.preventDefault();
            newContract();
          }}>
          Deploy
        </div>
      </div>

      <div className="existing-contracts">
        <h1> Existing Contracts </h1>
        <div id="container">
          {escrows.map((escrow) => <Escrow key={escrow.address} {...escrow} />)}
        </div>
      </div>

      <div className="escrow-history">
        <h1> Escrow History </h1>
        <table>
          <thead>
            <tr>
              <th>Contract Address</th>
              <th>Arbiter</th>
              <th>Depositor</th>
              <th>Balance (ETH)</th>
              <th>Beneficiary</th>
            </tr>
          </thead>
          <tbody>
            {escrowHistory.map((entry, index) => (
              <tr key={index}>
                <td>{entry.contractAddress}</td>
                <td>{entry.arbiter}</td>
                <td>{entry.depositor}</td>
                <td>{entry.balance}</td>
                <td>{entry.beneficiary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default App;
