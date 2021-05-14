const baseURL = 'http://localhost:8081';

const initResetButton = () => {
    // if you want to reset your DB data, click this button:
    document.querySelector('#reset').onclick = ev => {
        fetch(`${baseURL}/reset/`)
            .then(response => response.json())
            .then(data => {
                console.log('reset:', data);
            });
    };
};

const initNewDoctorButton = () => {
    document.querySelector('#new-doctor').onclick = ev => {
        document.querySelector('#doctor-display').innerHTML = '';
        document.getElementById("new-doctor-form").style.visibility = "visible"
    };
};
const initCancelButton = () => {
    document.querySelector('#cancel').onclick = ev => {
        document.getElementById("new-doctor-form").style.visibility = "hidden"
        getDoctors();
    };
};

function validateForm() {
    var name = document.forms["new-doctor-form"]["name"].value;
    var seasons = document.forms["new-doctor-form"]["seasons"].value;
    var ordering = document.forms["new-doctor-form"]["ordering"].value;
    var image = document.forms["new-doctor-form"]["image"].value;

    if (name == "") {
      alert("Name must be filled out");
      return false;
    }
    if (seasons == "") {
        alert("Seasons must be filled out");
        return false;
    }
    if (ordering == "" || isNaN(ordering)) {
        alert("Ordering must be filled out and must be a number");
        return false;
    }
    if (image == "") {
        alert("Image must be filled out");
        return false;
    }
  }


const processSave = ev => {
    validateForm();
    document.getElementById("new-doctor-form").style.visibility = "hidden"

    const data = {
        name: document.getElementById('name').value,
        seasons: document.getElementById('seasons').value.split(','),
        ordering: document.getElementById('ordering').value,
        image_url: document.getElementById('image_url').value
    }
    fetch('/doctors', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                // send to catch block:
                throw Error(response.statusText);
            } else {
                return response.json();
            }
        })
        .then(data => {
            console.log('Success:', data);
            getDoctor(data._id);
            getDoctors();
        })
    ev.preventDefault();
};

const prepareEdit = (doctor, ev) => {
    // prepopulate
    document.getElementById("edit-doctor-form").style.visibility = "visible";
    document.getElementById('edit-name').value = doctor.name;
    document.getElementById('edit-seasons').value = doctor.seasons.join(',');
    document.getElementById('edit-ordering').value = doctor.ordering;
    document.getElementById('edit-image_url').value = doctor.image_url;
}

const processEdit = (id, ev) => {
    console.log(id)
    document.getElementById("new-doctor-form").style.visibility = "hidden"

    const data = {
        name: document.getElementById('name').value,
        seasons: document.getElementById('seasons').value.split(','),
        ordering: document.getElementById('ordering').value,
        image_url: document.getElementById('image_url').value
    }
    fetch('/doctors', {
            method: 'PATCH', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                // send to catch block:
                throw Error(response.statusText);
            } else {
                return response.json();
            }
        })
        .then(data => {
            console.log('Success:', data);
            getDoctor(data._id);
            getDoctors();
        })
    ev.preventDefault();
};
const processDelete = (id, ev) => {
    const url = `/doctors/${id}`;
    if (window.confirm("Do you really want to delete this?")) {
        fetch(url, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                // send to catch block:
                throw Error(response.statusText);
            } else {
                // because the endpoint returns a 
                // null value, use the text() method
                // instead of the .json() method:
                return response.text();
            }
        })
        .then(data => {
            console.log('Success:', data);
            document.querySelector('#doctor-display').innerHTML = '';
            document.querySelector('#companions').innerHTML = '';

            getDoctors();
        })
        .catch(err => {
            console.error(err);
            alert('Error!');
        });
    ev.preventDefault();    }

};

const getDoctor = (id) => {
    let doctor;
    let companions;
    fetch('doctors/'+id.toString())
        .then(response => response.json())
        .then(data => {
            // store the retrieved data in a global variable called "doctors"
            doctor = data;
            
            // create edit button
            const doctorHeader__Edit = document.createElement('button');
            doctorHeader__Edit.addEventListener('click', () => prepareEdit(doctor));
            doctorHeader__Edit.setAttribute('id', 'edit');
            doctorHeader__Edit.innerHTML = 'Edit';

            // create delete button
            const doctorHeader__Delete = document.createElement('button');
            doctorHeader__Delete.addEventListener('click', () => processDelete(doctor._id));
            doctorHeader__Delete.setAttribute('id', 'delete');
            doctorHeader__Delete.innerHTML = 'Delete';

            document.querySelector('#doctor-display').innerHTML =
            `
                <div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center;">
                    <h1>${doctor.name}</h1>
                    <div id="doctor-buttons"></div>
                </div>
                <img src=${doctor.image_url}>
                <p>Seasons: ${doctor.seasons.join(', ')}</p>`

            document.getElementById('doctor-buttons').appendChild(doctorHeader__Edit);
            document.getElementById('doctor-buttons').appendChild(doctorHeader__Delete);
        })
    fetch('doctors/'+id.toString()+'/companions')
        .then(response => response.json())
        .then(data => {
            companions = data;
            const listItems = data.map(item => `
            <div style="display: flex; align-items: center; border: 1px solid gray">
                <img width="100px"src="${item.image_url}">
                <p data-id="${item._id}">${item.name}</p>
            </div>`
        );
        document.getElementById('companions').innerHTML = `
            <div>
                <h1>Companions</h1>
                ${listItems.join('')}
            </div>`
        })
}

const getDoctors = () => {
    document.querySelector('#doctors').innerHTML = '';

    let doctors;
    fetch('/doctors')
        .then(response => response.json())
        .then(data => {
            doctors = data;
            const listItems = data.map(item => {
                const listElem = document.createElement('li');
                const aElem = document.createElement('a');
                aElem.setAttribute('href', '#');
                aElem.addEventListener('click', () => getDoctor(item._id));
                aElem.setAttribute('data-id', item._id);
                aElem.innerHTML = item.name
                listElem.appendChild(aElem);
                return listElem;
            }
            );
            const parentListElem = document.createElement('ul');
            listItems.forEach((elem) => parentListElem.appendChild(elem));
            document.getElementById('doctors').appendChild(parentListElem);
    })
}


// invoke this function when the page loads:
getDoctors();
initResetButton();
initNewDoctorButton();
initCancelButton();
document.querySelector('#create').onclick = processSave;
document.querySelector('#edit-create').onclick = processEdit;