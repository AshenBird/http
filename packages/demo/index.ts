import { createHttp, defineAPI } from "@mcswift/http"

const H = createHttp({
  baseURL:"",
  APIs:{
    test:defineAPI<string>({
      url:"/"
    })
  }
})

H.test()




