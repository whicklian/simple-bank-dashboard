document.addEventListener('DOMContentLoaded', () => {
    fetchAccounts();

    const transferForm = document.getElementById('transfer-form');
    transferForm.addEventListener('submit', handleTransfer);
});

async function fetchAccounts(){
    try{
        const response = await fetch('http://localhost:5000/api/accounts');
        const accounts = await response.json();

        const tbody = document.getElementById('accounts-table-body');
        tbody.innerHTML = '';

        accounts.forEach(acc => {
            tbody.innerHTML += `
           <tr>
               <td>${acc.account_id}</td>
               <td>${acc.account_holder}</td>
               <td>$${parseFloat(acc.balance).toFixed(2)}</td>
           </tr>
           `;
        });
    }catch (err) {
        console.error('Error fetching accounts:', err);
    }
}

async function handleTransfer(e){
    e.preventDefault();

    const transferForm = document.getElementById('transfer-form');
    const from_account = document.getElementById('from-account').value;
    const to_account = document.getElementById('to-account').value;
    const amount = document.getElementById('amount').value;
    
    // FIX: Removed .value because this is a message container element, not an input!
    const msgEl = document.getElementById('message');

    try{
        const response = await fetch('http://localhost:5000/api/accounts/transfer',{
            method:'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({from_account, to_account, amount})
        });

        const result = await response.json();

        if (result.success){
            // FIX: matches 'messages' or 'message' depending on your backend response
            msgEl.textContent = result.messages || result.message;
            msgEl.className = 'success';
            transferForm.reset();
            fetchAccounts();
        }else{
            msgEl.textContent = result.errmessage || result.error;
            msgEl.className = 'error';
        }
    }catch (err) {
        msgEl.textContent = 'An unexpected error occurred';
        msgEl.className = 'error';
    }
}