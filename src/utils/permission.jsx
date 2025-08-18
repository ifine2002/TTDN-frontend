export const ALL_PERMISSIONS = {
    RATINGS: {
        GET_PAGINATE: { method: "GET", apiPath: '/review/rating/list', module: "RATINGS" },
        CREATE: { method: "POST", apiPath: '/review/rating', module: "RATINGS" },
        UPDATE: { method: "PUT", apiPath: '/review/rating/{id}', module: "RATINGS" },
        DELETE: { method: "DELETE", apiPath: '/review/rating/{id}', module: "RATINGS" },
    },
    COMMENTS: {
        GET_PAGINATE: { method: "GET", apiPath: '/review/comment/list', module: "COMMENTS" },
        CREATE: { method: "POST", apiPath: '/review/comment', module: "COMMENTS" },
        UPDATE: { method: "PUT", apiPath: '/review/comment/{id}', module: "COMMENTS" },
        DELETE: { method: "DELETE", apiPath: '/review/comment/{id}', module: "COMMENTS" },
    },
    PERMISSIONS: {
        GET_PAGINATE: { method: "GET", apiPath: '/permission/list', module: "PERMISSIONS" },
        CREATE: { method: "POST", apiPath: '/permission/', module: "PERMISSIONS" },
        UPDATE: { method: "PUT", apiPath: '/permission/{id}', module: "PERMISSIONS" },
        DELETE: { method: "DELETE", apiPath: '/permission/{id}', module: "PERMISSIONS" },
    },
    CATEGORIES: {
        GET_PAGINATE: { method: "GET", apiPath: '/category/list', module: "CATEGORIES" },
        CREATE: { method: "POST", apiPath: '/category/', module: "CATEGORIES" },
        UPDATE: { method: "PUT", apiPath: '/category/{id}', module: "CATEGORIES" },
        DELETE: { method: "DELETE", apiPath: '/category/{id}', module: "CATEGORIES" },
    },
    ROLES: {
        GET_PAGINATE: { method: "GET", apiPath: '/role/list', module: "ROLES" },
        CREATE: { method: "POST", apiPath: '/role/', module: "ROLES" },
        UPDATE: { method: "PUT", apiPath: '/role/{id}', module: "ROLES" },
        DELETE: { method: "DELETE", apiPath: '/role/{id}', module: "ROLES" },
    },
    USERS: {
        GET_PAGINATE: { method: "GET", apiPath: '/user/list', module: "USERS" },
        CREATE: { method: "POST", apiPath: '/user/', module: "USERS" },
        UPDATE: { method: "PUT", apiPath: '/user/{id}', module: "USERS" },
        DELETE: { method: "DELETE", apiPath: '/user/{id}', module: "USERS" },
    },
    FOLLOWS: {
        GET_PAGINATE: { method: "GET", apiPath: '/follow/list', module: "FOLLOWS" },
        CREATE: { method: "POST", apiPath: '/follow/', module: "FOLLOWS" },
        DELETE: { method: "DELETE", apiPath: '/follow/{id}', module: "FOLLOWS" },
    },
    BOOKS: {
        GET_PAGINATE: { method: "GET", apiPath: '/book/list', module: "BOOKS" },
        CREATE: { method: "POST", apiPath: '/book/', module: "BOOKS" },
        UPDATE: { method: "PUT", apiPath: '/book/{id}', module: "BOOKS" },
        DELETE: { method: "DELETE", apiPath: '/book/{id}', module: "BOOKS" },
    },
    APPROVED_BOOKS: {
        GET_PAGINATE: { method: "GET", apiPath: '/book/list-none', module: "BOOKS" },
        APPROVE: { method: "PATCH", apiPath: '/book/approve/{id}', module: "BOOKS" },
        REJECT: { method: "PATCH", apiPath: '/book/reject/{id}', module: "BOOKS" },
    }
}

export const ALL_MODULES = {
    PERMISSIONS: 'PERMISSIONS',
    ROLES: 'ROLES',
    USERS: 'USERS',
    BOOKS: 'BOOKS',
    CATEGORIES: 'CATEGORIES',
    COMMENTS: 'COMMENTS',
    FOLLOWS: 'FOLLOWS',
    RATINGS: 'RATINGS',
}
