'use babel';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import runGitCommand from './runCommand';
import findRepoRoot from './findRepoRoot';
function getRepoRemotes(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const repoRoot = findRepoRoot(filePath);
        try {
            const remotes = yield runGitCommand(repoRoot, 'remote -v');
            if (remotes === '') {
                return [];
            }
            return remotes
                .trim()
                .split('\n')
                .map(remote => {
                const matchedRemote = remote.match(/(.+)\t(.+)\s\((.+)\)/);
                return {
                    name: matchedRemote[1],
                    url: matchedRemote[2],
                    type: matchedRemote[3],
                };
            });
        }
        catch (e) {
            throw e;
        }
    });
}
export default getRepoRemotes;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3Rlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9naXQvcmVtb3Rlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7Ozs7OztBQUVaLE9BQU8sYUFBYSxNQUFNLGNBQWMsQ0FBQztBQUN6QyxPQUFPLFlBQVksTUFBTSxnQkFBZ0IsQ0FBQztBQUUxQyx3QkFBOEIsUUFBZ0I7O1FBQzVDLE1BQU0sUUFBUSxHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUM7WUFDSCxNQUFNLE9BQU8sR0FBRyxNQUFNLGFBQWEsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDM0QsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ25CLE1BQU0sQ0FBQyxFQUFFLENBQUM7WUFDWixDQUFDO1lBQ0QsTUFBTSxDQUFDLE9BQU87aUJBQ1gsSUFBSSxFQUFFO2lCQUNOLEtBQUssQ0FBQyxJQUFJLENBQUM7aUJBQ1gsR0FBRyxDQUFDLE1BQU07Z0JBQ1QsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO2dCQUMzRCxNQUFNLENBQUM7b0JBQ0wsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7b0JBQ3RCLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO29CQUNyQixJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQztpQkFDdkIsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDWCxNQUFNLENBQUMsQ0FBQztRQUNWLENBQUM7SUFDSCxDQUFDO0NBQUE7QUFFRCxlQUFlLGNBQWMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgcnVuR2l0Q29tbWFuZCBmcm9tICcuL3J1bkNvbW1hbmQnO1xuaW1wb3J0IGZpbmRSZXBvUm9vdCBmcm9tICcuL2ZpbmRSZXBvUm9vdCc7XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFJlcG9SZW1vdGVzKGZpbGVQYXRoOiBzdHJpbmcpIHtcbiAgY29uc3QgcmVwb1Jvb3QgPSBmaW5kUmVwb1Jvb3QoZmlsZVBhdGgpO1xuICB0cnkge1xuICAgIGNvbnN0IHJlbW90ZXMgPSBhd2FpdCBydW5HaXRDb21tYW5kKHJlcG9Sb290LCAncmVtb3RlIC12Jyk7XG4gICAgaWYgKHJlbW90ZXMgPT09ICcnKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHJldHVybiByZW1vdGVzXG4gICAgICAudHJpbSgpXG4gICAgICAuc3BsaXQoJ1xcbicpXG4gICAgICAubWFwKHJlbW90ZSA9PiB7XG4gICAgICAgIGNvbnN0IG1hdGNoZWRSZW1vdGUgPSByZW1vdGUubWF0Y2goLyguKylcXHQoLispXFxzXFwoKC4rKVxcKS8pO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG5hbWU6IG1hdGNoZWRSZW1vdGVbMV0sXG4gICAgICAgICAgdXJsOiBtYXRjaGVkUmVtb3RlWzJdLFxuICAgICAgICAgIHR5cGU6IG1hdGNoZWRSZW1vdGVbM10sXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHRocm93IGU7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgZ2V0UmVwb1JlbW90ZXM7XG4iXX0=