const BASE_URL = 'https://lighthouse-user-api.herokuapp.com/'
const INDEX_URL = BASE_URL + 'api/v1/users/'



const userList = []
let filterUser = []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const USER_PER_PAGE = 12 // 單頁顯示user資料數


function showUserList(data) {
  let htmlContent = ''
  data.forEach((item) => {
    htmlContent += `
    <div class="col-sm-3 mb-2">
        <div class="card border-primary">
         <h3 class="card-header border-primary text-center mb-0">${item.name + "\t" + item.surname}</h3>
         <div class="card-body">
            <img src="${item.avatar}" class="card-img-top" alt="Avatar">
         </div>
         <div class="card-footer text-end border-primary">
            <button type="button" class="btn btn-primary btn-info" data-bs-toggle="modal" data-bs-target="#info-modal" data-id="${item.id
      }"> Info </button>
            <button class="btn btn-primary btn-add-user" data-id=${item.id}> + </button>
          </div>
        </div>
    </div>
    `
  })
  dataPanel.innerHTML = htmlContent
}

function showUserInfo(id) {
  // show name, gender, age , region, birthday, email
  const modalAvatar = document.querySelector('#user-avatar-info')
  const modalName = document.querySelector('.user-name')
  const modalGender = document.querySelector('.user-gender')
  const modalAge = document.querySelector('.user-age')
  const modalRegion = document.querySelector('.user-region')
  const modalBirthday = document.querySelector('.user-birthday')
  const modalEmail = document.querySelector('.user-email')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data

    modalName.innerText = 'Name : ' + data.name + ' ' + data.surname
    modalGender.innerText = 'Gender : ' + data.gender
    modalAge.innerText = 'Age : ' + data.age
    modalRegion.innerText = 'Region : ' + data.region
    modalBirthday.innerText = 'Birthday : ' + data.birthday
    modalEmail.innerText = data.email
    modalAvatar.innerHTML = `<img src='${data.avatar}' alt="user-avatar" class="img-fluid position-absolute top-50 start-50 translate-middle">`
  })
}

// 添加使用者含式
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteUser')) || []
  const user = userList.find((user) => user.id === id)

  if (list.some((user) => user.id === id)) {
    return alert('User has already been added !')
  }

  list.push(user)
  localStorage.setItem('favoriteUser', JSON.stringify(list))
}


//取出特定頁面的 user 資料
function getUserByPage(page) {

  // 若有搜尋這個動作，就根據搜尋結果來顯示頁數，沒有搜尋動作則顯示全部 user 資料
  const data = filterUser.length ? filterUser : userList
  //計算起始index(起始頁數)
  const startIndex = (page - 1) * USER_PER_PAGE

  const value = searchInput.value

  //檢查輸入是否為空值，若為空顯示全部資料
  if (value.length === 0) {
    return userList.slice(startIndex, startIndex + USER_PER_PAGE)
  }


  //切割後的新陣列即為分割後的頁數，對應此範圍的 user 名單資料
  return data.slice(startIndex, startIndex + USER_PER_PAGE)


}


//製作頁數資料函式
function renderPage(amount) {
  //計算總頁數
  const totalPages = Math.ceil(amount / USER_PER_PAGE)
  // 製作 page template
  let pageHtml = ''

  for (let page = 1; page < totalPages; page++) {
    pageHtml += `<li class="page-item"><a class="page-link" href="#" data-page=${page}>${page}</a></li>`
  }
  paginator.innerHTML = pageHtml

}

// 所有 user 名單資料
function showAllUser() {
  const value = searchInput.value
  if (!value) {
    renderPage(userList.length) // 分割頁數    
    showUserList(getUserByPage(1)) // 取得特定頁數的 user 資料
  }
}


// 當點擊輸入框，輸入值為空的觸發事件
searchForm.addEventListener('click', showAllUser)

// 當鍵盤放開那一剎那，輸入值為空的觸發事件
searchForm.addEventListener('keyup', showAllUser)




dataPanel.addEventListener('click', function onPanelClick(event) {
  // 找出個別 user的 id ，並顯示個人資料
  if (event.target.matches('.btn-info')) {
    showUserInfo(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-user')) {
    // 將 user 加入收藏清單
    addToFavorite(Number(event.target.dataset.id))
  }
})


searchForm.addEventListener('submit', function searchFormSubmitted(event) {
  event.preventDefault() // 防止瀏覽器 submit 時自動跳轉頁面
  const keyword = searchInput.value.trim().toLowerCase()

  filterUser = userList.filter((user) =>
    user.name.toLowerCase().includes(keyword)
  )
  // 搜尋不到user時，彈出視窗 
  if (filterUser.length === 0) {
    return alert(`No matching user : ${keyword}`)
  }
  // 根據搜尋結果製作分頁
  renderPage(filterUser.length)
  // 預設顯示第1頁的資料
  showUserList(getUserByPage(1))

})


paginator.addEventListener('click', function pageClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)

  //更新網頁畫面資料
  showUserList(getUserByPage(page))

})



axios
  .get(INDEX_URL)
  .then((response) => {
    userList.push(...response.data.results)
    renderPage(userList.length) // 分割頁數    
    showUserList(getUserByPage(1)) // 取得特定頁數的 user 資料
  })
  .catch((err) => console.log(err))



