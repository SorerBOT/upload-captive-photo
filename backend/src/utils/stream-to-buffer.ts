// import type { ReadType } from 

// export async function stream2buffer(stream: ReadStream): Promise<Buffer> {

//     return new Promise < Buffer > ((resolve, reject) => {
        
//         const _buf = Array < any > ();

//         stream.on("data", chunk => _buf.push(chunk));
//         stream.on("end", () => resolve(Buffer.concat(_buf)));
//         stream.on("error", err => reject(`error converting stream - ${err}`));

//     });
// } 