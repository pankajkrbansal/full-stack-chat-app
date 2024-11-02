import {faker} from "@faker-js/faker"
import {User} from "../models/user.model.js"

const createUser = async(numUsers) => {
    try {
        const userPromise = []
        for(let i = 0; i < numUsers; i++){
            const tempUser = User.create({
                name: faker.person.fullName(),
                username: faker.internet.userName(),
                password:"pwd",
                avatar:{
                    url:faker.image.avatar(),
                    public_id: faker.system.fileName()
                }
            })
            userPromise.push()
        }
        await Promise.all(userPromise)
    } catch (error) {
        process.exit(1)
    }
}

// createUser(10)
export {createUser}