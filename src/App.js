import {useEffect, useState} from 'react';
import './App.css';
import {formatEther} from 'ethers';

const {ethers} = require("ethers")

const apiKey = process.env.REACT_APP_ALCHEMY_API_KEY;
const url = `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`;

const provider = new ethers.JsonRpcProvider(url);

console.log(provider.getBlockNumber())
function App() {
    const [inputBlockNumber, setInputBlockNumber] = useState("");
    const [blockNumber, setBlockNumber] = useState();
    const [blockTransactions, setBlockTransactions] = useState([]);
    const [transactionSelected, setTransactionSelected] = useState("");

    useEffect(() => {
        async function getBlockNumber() {
            setBlockNumber(await provider.getBlockNumber());
        }

        getBlockNumber();
    }, []);

    useEffect(() => {
        async function setTransactions() {
            try {
                const blockWithTransactions = await provider.provider.getBlock(blockNumber, true);
                console.log(blockWithTransactions.prefetchedTransactions); // Log transactions to console
                setBlockTransactions(blockWithTransactions.prefetchedTransactions );
            } catch (error) {
                console.error("Error fetching transactions:", error);
                setBlockTransactions([]);
            }
        }

        if (blockNumber != null) {
            setTransactions();
        }
    }, [blockNumber]);

    const handleInputChange = (e) => {
        setInputBlockNumber(e.target.value);
    };

    const handleSubmitBlockNumber = () => {
        const num = parseInt(inputBlockNumber, 10);
        if (!isNaN(num) && num >= 0) {
            setBlockNumber(num);
        } else {
            alert("Please enter a valid block number.");
        }
    };


    const handleSelectTransaction = (hash) => {
        if (blockTransactions.length === 0) setTransactionSelected('')

        setTransactionSelected(hash)
    }

    const calcFee = (transaction, toFixed) => {
        const gasFee = transaction.gasLimit * transaction.gasPrice

        if (gasFee.toString() === "NaN") return "0";

        return parseFloat(formatEther(gasFee.toString())).toFixed(toFixed)
    }

    const reloadToCurrentBlock = async () => {
        const currentBlockNumber = await provider.getBlockNumber();
        setBlockNumber(currentBlockNumber);
    };

    const previousBlock = () => {
        const actualBlocknumber = blockNumber - 1 < 0 ? 0 : blockNumber - 1
        setBlockNumber(actualBlocknumber)
    }

    const nextBlock = () => {
        const actualBlocknumber = blockNumber + 1
        setBlockNumber(actualBlocknumber)
    }

    const getSubstring = (data, index) => {
        try {
            return `${data.substring(0, index)}...`
        } catch (error) {
            return ''
        }
    }

    const getTransaction = (hash) => {
        const transactions = [...blockTransactions];
        const index = transactions.findIndex(tx => tx.hash === hash)
        if (index >= 0) return transactions[index];

        return {};
    }

    const BlockInput = () => {
        const [inputBlockNumber, setInputBlockNumber] = useState("");

        const handleInputChange = (e) => {
            setInputBlockNumber(e.target.value);
        };

        const handleSubmitBlockNumber = () => {
            const num = parseInt(inputBlockNumber, 10);
            if (!isNaN(num) && num >= 0) {
                setBlockNumber(num);
            } else {
                alert("Please enter a valid block number.");
            }
        };

        return (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
                <input
                    type="number"
                    value={inputBlockNumber}
                    onChange={handleInputChange}
                    placeholder="Enter block number"
                />
                <button onClick={handleSubmitBlockNumber}>Go</button>
            </div>
        );
    };


    const Block = () => {
        return (
            <>
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 24,
                    fontSize: 24,
                }}>
                    <b>Block Details</b>
                </div>
                <div style={{display: "flex", justifyContent: "center", marginTop: 24}}>
                    <button style={{marginRight: 24}} onClick={() => previousBlock()}>Previous Block</button>
                    <p>{` Block Number: ${blockNumber} `}</p>
                    <button style={{marginLeft: 24}} onClick={() => nextBlock()}>Next Block</button>
                </div>
            </>
        );
    }

    const Transactions = () => {
        return (
            <>
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 24,
                    fontSize: 12,
                    overflow: "auto",
                    maxHeight: "20rem",
                    cursor: "pointer"
                }}>
                    <table>
                        <thead>
                        <tr>
                            <th>Transaction Hash</th>
                            <th>Block</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Confirmations</th>
                            <th>Value</th>
                            <th>Transaction Fee</th>
                            <th>Data</th>
                        </tr>
                        </thead>
                        <tbody>
                        {blockTransactions.map(transaction => {
                            return (
                                <tr key={transaction.hash} onClick={() => handleSelectTransaction(transaction.hash)}>
                                    <th>{getSubstring(transaction.hash, 15)}</th>
                                    <th>{transaction.blockNumber}</th>
                                    <th>{getSubstring(transaction.from, 15)}</th>
                                    <th>{getSubstring(transaction.to, 15)}</th>
                                    <th>{transaction.confirmations}</th>
                                    <th>{parseFloat(formatEther(transaction.value.toString())).toFixed(12)}</th>
                                    <th>{calcFee(transaction, 5)}</th>
                                    <th>{getSubstring(transaction.data, 15)}</th>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
            </>
        );
    }

    const Detail = (props) => {
        return (
            <div style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                marginLeft: 24,
                fontSize: 14,
            }}>
                <p style={{marginLeft: 10, marginRight: 10, fontWeight: "bold"}}>{props.name}:</p>
                <p>{props.value}</p>
            </div>
        )
    }

    const TransactionDetail = (props) => {
        return (
            <>
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 24,
                    fontSize: 24,
                }}>
                    <b>{"Transaction Hash"}</b>
                </div>

                <Detail name={"Transaction Hash"} value={props.transaction.hash}/>
                <Detail name={"Block"} value={props.transaction.blockNumber}/>
                <Detail name={"From"} value={props.transaction.from}/>
                <Detail name={"To"} value={props.transaction.to}/>
                <Detail name={"Confirmations"} value={props.transaction.confirmations}/>
                <Detail name={"value"}
                        value={props.transaction?.value ? parseFloat(formatEther(props.transaction?.value.toString())) : "0"}/>
                <Detail name={"Transaction Fee"} value={calcFee(props.transaction, 18)}/>
                <div style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    marginLeft: 24,
                    fontSize: 14,
                }}>
                    <p style={{marginLeft: 10, marginRight: 10, fontWeight: "bold"}}>Data:</p>
                    <p style={{wordBreak: 'break-all'}}>{props.transaction.data}</p>
                </div>
            </>
        )
    }

    const BlockControls = () => {
        return (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
                <button onClick={reloadToCurrentBlock}>Reload to Current Block</button>
            </div>
        );
    };

    return (
        <>
            <BlockInput />
            <Block />
            <Transactions />
            <BlockControls />
            {transactionSelected && <TransactionDetail transaction={getTransaction(transactionSelected)} />}
        </>
    );

}

export default App;
