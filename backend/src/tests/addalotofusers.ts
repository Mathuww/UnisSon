import '../models/index.js';
import User from '../models/elem/User.model.js';
import Group from '../models/elem/Group.model.js';
import { dbConnect } from '../shared/dbconnect.js';


const users = [
    {
        nickname: 'Ezechiel',
        email: 'ezechiel@paf.com'
    },
    {
        nickname: 'Gramommyny',
        email: 'gramommnyny@paf.com'
    },
    {
        nickname: 'Metatron',
        email: 'age@heaven.com'
    },
    {
        nickname: 'Chronos',
        email: 'ezechichronosel@paf.com'
    },
    {
        nickname: 'Pablo',
        email: 'pablopablo@paf.com'
    },
    {
        nickname: 'Gaia 3 MEGATEST',
        email: 'gaiagaia@paf.com'
    },
    {
        nickname: 'Le Tom',
        email: 'letomdebrebis@paf.com'
    },
    {
        nickname: 'AsynaAsynaAsynaa',
        email: 'ciscsopacketracer@dango.com'
    }
];


await dbConnect();
const group = await Group.findByPk(14);

for (const user of users) {
    const userRef = await User.create(user);
    await group?.addUser(userRef.id);
}