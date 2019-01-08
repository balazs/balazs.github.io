var version_categories = "2.4";
var defaultAddButton = {
    "icon": "img/qa/quick_access_icons/add.png",
    "title": "Add",
    "link": "add_qa_link",
    "color": "#bababa"
};
var data = {
    quickAccess: [],
    dynamicQuickAccess: [defaultAddButton]
};

const allCategories = ["top","world","national","business","tech","entertainment",
  "sports","science","politics","health","food","travel"];

var userCategories = {
    'top': {
        title: 'Top News',
        cp: 'sns',
        id: '0',
        position: '0',
        category:'top',
        selected: true
    },
    'world': {
        title: 'World',
        cp: 'sns',
        id: '1',
        position: '1',
        category:'world',
        selected: true
    },
    'national': {
        title: 'U.S.',
        cp: 'sns',
        id: '2',
        position: '2',
        category:'national',
        selected: true
    },
    'business': {
        title: 'Business',
        cp: 'sns',
        id: '3',
        position: '3',
        category:'business',
        selected: true
    },
    'tech': {
        title: 'Technology',
        cp: 'sns',
        id: '4',
        position: '4',
        category:'tech',
        selected: true
    },
    'entertainment': {
        title: 'Entertainment',
        cp: 'sns',
        id: '5',
        position: '5',
        category:'entertainment',
        selected: true
    },
    'sports': {
        title: 'Sports',
        cp: 'sns',
        id: '6',
        position: '6',
        category:'sports',
        selected: true
    },
    'science': {
        title: 'Science',
        cp: 'sns',
        id: '7',
        position: '7',
        category:'science',
        selected: true
    },
    'politics': {
        title: 'Politics',
        cp: 'sns',
        id: '8',
        position: '8',
        category:'politics',
        selected: true
    }, 
    'health': {
        title: 'Health',
        cp: 'sns',
        id: '9',
        position: '9',
        category:'health',
        selected: true
    },
    'food': {
        title: 'Food',
        cp: 'sns',
        id: '10',
        position: '10',
        category:'food',
        selected: true
    },
    'travel': {
        title: 'Travel',
        cp: 'sns',
        id: '11',
        position: '11',
        category:'travel',
        selected: true
    }
};
const originalCategories = [
    {
        title: 'Top News',
        cp: 'sns',
        id: '0',
        position: '0',
        category:'top'
    },
     {
        title: 'World',
        cp: 'sns',
        id: '1',
        position: '1',
        category:'world'
    },
    {
        title: 'U.S.',
        cp: 'sns',
        id: '2',
        position: '2',
        category:'national'
    },
     {
        title: 'Business',
        cp: 'sns',
        id: '3',
        position: '3',
        category:'business'
    },
     {
        title: 'Technology',
        cp: 'sns',
        id: '4',
        position: '4',
        category:'tech'
    },
     {
        title: 'Entertainment',
        cp: 'sns',
        id: '5',
        position: '5',
        category:'entertainment'
    },
     {
        title: 'Sports',
        cp: 'sns',
        id: '6',
        position: '6',
        category:'sports'
    },
     {
        title: 'Science',
        cp: 'sns',
        id: '7',
        position: '7',
        category:'science'
    },
     {
        title: 'Politics',
        cp: 'sns',
        id: '8',
        position: '8',
        category:'politics'
    }, 
    {
        title: 'Health',
        cp: 'sns',
        id: '9',
        position: '9',
        category:'health'
    },
     {
        title: 'Food',
        cp: 'sns',
        id: '10',
        position: '10',
        category:'food'
    },
     {
        title: 'Travel',
        cp: 'sns',
        id: '11',
        position: '11',
        category:'travel'
    }
];
var locationsList = [{

}];

var languageslist = [
    {
        id: 'en',
        lang: "English"
    }
];
